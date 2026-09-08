using backend.Data;
using backend.Dtos;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface ICalendarService
    {
        Task<Event> GetEvent(Guid id);
        Task<List<CalendarEventDto>> GetEvents(TeamMember user);
        Task<Event> CreateEvent(CreateEventDto dto, string currentUserId);
        Task<Event> UpdateEvent(UpdateEventDto dto, TeamMember organizer);
        Task DeleteEvent(Guid eventId, string organizerId);
    }
    public class CalendarService : ICalendarService
    {
        private readonly TeamDbContext _context;
        private readonly UserManager<TeamMember> _userManager;
        private readonly IBackgroundTaskQueue _backgroundQueue;
        private readonly ILogger<CalendarService> _logger;

        public CalendarService(TeamDbContext context, ILogger<CalendarService> logger, UserManager<TeamMember> userManager, IBackgroundTaskQueue backgroundQueue)
        {
            _context = context;
            _userManager = userManager;
            _backgroundQueue = backgroundQueue;
            _logger = logger;
        }

        public async Task<Event> CreateEvent(CreateEventDto dto, string currentUserId)
        {
            if (dto.End < dto.Start) throw new InvalidOperationException("Unable to create event");
            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                Location = dto.Location?.Trim(),
                Start = dto.Start,
                End = dto.End,
                OrganizerId = currentUserId,
                IsMeeting = dto.IsMeeting,
            };

            var conflictedUserIds = await _context.Events
                .Where(e => dto.AttendeeIds.Contains(e.OrganizerId) || e.Attendees.Any(a => dto.AttendeeIds.Contains(a.UserId)))
                .Where(e => e.Start < dto.End && e.End > dto.Start)
                .SelectMany(e => e.Attendees.Select(a => a.UserId))
                .ToListAsync();
            var conflictSet = conflictedUserIds.ToHashSet();

            newEvent.Attendees = dto.AttendeeIds.Select(id => new EventAttendee
            {
                UserId = id,
                HadOverlapAtCreation = conflictSet.Contains(id),
            }).ToList();

            await _context.Events.AddAsync(newEvent);
            await _context.SaveChangesAsync();

            if (newEvent.IsMeeting)
            {
                var newMeeting = new Meeting
                {
                    EventId = newEvent.Id,
                    CreatedAt = DateTime.UtcNow,
                    Event = newEvent,
                    HostId = newEvent.OrganizerId,
                    Status = MeetingStatus.Scheduled,
                    Host = newEvent.Organizer,
                };
                await _context.Meetings.AddAsync(newMeeting);
                await _context.SaveChangesAsync();

                newEvent.EventMeetingId = newMeeting.Id;
                await _context.SaveChangesAsync();
                var meetingAttendees = dto.AttendeeIds.Select(ai => new MeetingAttendee
                {
                    Id = Guid.NewGuid(),
                    Meeting = newMeeting,
                    MeetingId = newMeeting.Id,
                    UserId = ai,
                }).ToList();
                _context.MeetingAttendees.AddRange(meetingAttendees);
                await _context.SaveChangesAsync();
            }

            await _backgroundQueue.QueueAsync(async (services, ct) =>
            {
                var db = services.GetRequiredService<TeamDbContext>();
                var hub = services.GetRequiredService<IHubContext<ChatHub>>();
                var emailService = services.GetRequiredService<IEmailService>();

                var savedEvent = await db.Events.Include(e => e.Attendees).
                        ThenInclude(e => e.User).
                        FirstAsync(e => e.Id == newEvent.Id, ct);

                foreach (var attendee in savedEvent.Attendees)
                {
                    await hub.Clients.User(attendee.UserId).SendAsync("InvitedToEvent", savedEvent, ct);
                    try
                    {
                        await emailService.SendEventInvite(attendee.User, savedEvent, attendee.HadOverlapAtCreation, ct);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to email invite to {UserId} for event {EventId}", attendee.UserId, savedEvent.Id);
                    }

                }

                savedEvent.NotificationsSent = true;
                await db.SaveChangesAsync(ct);
            });
            return newEvent;
        }

        public async Task DeleteEvent(Guid eventId, string organizerId)
        {
            var eventToDelete = await _context.Events
                .Include(e => e.Attendees)
                .ThenInclude(e => e.User)
                .FirstOrDefaultAsync(e => e.Id == eventId) ?? throw new KeyNotFoundException("Event does not exist");

            if (eventToDelete.OrganizerId != organizerId)
                throw new UnauthorizedAccessException("Only the organizer can delete this event.");

            var attendees = eventToDelete.Attendees.Select(a => a.User).ToList();
            var eventTitle = eventToDelete.Title;
            var eventStart = eventToDelete.Start;

            _context.Events.Remove(eventToDelete);
            await _context.SaveChangesAsync();

            await _backgroundQueue.QueueAsync(async (serviceProvider, ct) =>
            {
                var hub = serviceProvider.GetRequiredService<IHubContext<ChatHub>>();
                var emailService = serviceProvider.GetRequiredService<IEmailService>();

                foreach (var attendee in attendees)
                {
                    await hub.Clients.User(attendee.Id).SendAsync("EventCancelled", eventId, ct);
                    try
                    {
                        await emailService.SendEventCancelledEmail(attendee, eventTitle, eventStart, ct);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send cancellation email to {UserId} for event {EventId}", attendee.Id, eventId);
                    }
                }
            });
        }

        public async Task<Event> GetEvent(Guid id)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Attendees)
                    .ThenInclude(a => a.User)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity is null)
                throw new KeyNotFoundException("Failed to locate event");
            return eventEntity;
        }

        public async Task<List<CalendarEventDto>> GetEvents(TeamMember user)
        {
            var myEvents = await _context.Events
                .Include(e => e.Organizer)
                .Include(e => e.Attendees)
                    .ThenInclude(a => a.User)
                    .Include(e => e.Meeting)
                .Where(e => e.OrganizerId == user.Id
                         || e.Attendees.Any(a => a.UserId == user.Id))
                .Select(e => new CalendarEventDto
                {
                    Id = e.Id,
                    Title = e.Title,
                    Description = e.Description,
                    Location = e.Location,
                    Start = e.Start,
                    End = e.End,
                    Organizer = e.Organizer.FirstName + " " + e.Organizer.LastName,
                    organizerId = e.OrganizerId,
                    Attendees = e.Attendees
                        .Select(a => a.User.FirstName + " " + a.User.LastName)
                        .ToList(),
                    IsMeeting = e.IsMeeting,
                    MeetingId = e.EventMeetingId ?? null,
                    MeetingStatus = e.Meeting != null ? e.Meeting.Status : null,
                })
                .AsNoTracking()
                .ToListAsync();
            return myEvents;
        }

        public async Task<Event> UpdateEvent(UpdateEventDto dto, TeamMember organizer)
        {
            var eventToUpdate = await _context.Events.Where(ev => (ev.OrganizerId == organizer.Id) &&
                           (ev.Id == dto.EventId)).FirstOrDefaultAsync();
            if (eventToUpdate is null) throw new KeyNotFoundException("No event matches the description");

            if (dto.Start is not null)
            {
                if (!DateTime.TryParse(dto.Start, out var start))
                   throw new InvalidOperationException("Enter a valid date format");
                eventToUpdate.Start = start;
            }

            if (dto.End is not null)
            {
                if (!DateTime.TryParse(dto.End, out var end))
                    throw new InvalidOperationException("Enter a valid date format");

                eventToUpdate.End = end;
            }

            if (eventToUpdate.End <= eventToUpdate.Start)
                throw new InvalidOperationException("The end of meeting must exceed the start time");

            if (dto.EventDescription is not null)
                eventToUpdate.Description = dto.EventDescription;

            if (dto.UserIds is not null)
            {
                var attendees = await _userManager.Users.Where(u => dto.UserIds.Contains(u.Id)).ToListAsync();
                if (attendees.Count != dto.UserIds.Count) throw new InvalidOperationException("Event must have at least one attendee");

                var conflictedUserIds = await _context.Events
                    .Where(e => e.Id != dto.EventId)
                .Where(e => e.Attendees.Any(a => dto.UserIds.Contains(a.UserId)))
                .Where(e => e.Start < eventToUpdate.End && e.End > eventToUpdate.Start)
                .SelectMany(e => e.Attendees.Select(a => a.UserId))
                .ToListAsync();
                var conflictSet = conflictedUserIds.ToHashSet();

                eventToUpdate.Attendees = dto.UserIds.Select(id => new EventAttendee
                {
                    UserId = id,
                    HadOverlapAtCreation = conflictSet.Contains(id),
                }).ToList();
            }
            await _context.SaveChangesAsync();
            var updatedEvent = eventToUpdate;
            return updatedEvent;
        }
    }
}
