using backend.Data;
using backend.Exceptions;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public interface IMeetingHubService
    {
        Task<List<string>> AddToMeeting(Guid meetingId, string userId, string connectionId);
        Task LeaveMeeting(Guid meetingId, string userId, string connectionId);
        Task OnConnected(string userId, string connectionId);
    }
    public class MeetingHubService : IMeetingHubService
    {
        private readonly TeamDbContext _context;
        private readonly IHubContext<MeetingHub> _hubContext;

        public MeetingHubService(TeamDbContext context, IHubContext<MeetingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<List<string>> AddToMeeting(Guid meetingId, string userId, string connectionId)
        {
            var meetingAttendee = await _context.MeetingAttendees
                .Include(a => a.Meeting)
                .FirstOrDefaultAsync(a => a.MeetingId == meetingId && a.UserId == userId) 
                ?? throw new MemberNotInvitedException("You are not invited to this meeting");;

            var isReconnect = meetingAttendee.Status == MeetingAttendeeStatus.Joined
                || meetingAttendee.Status == MeetingAttendeeStatus.Left;

            if (!isReconnect || meetingAttendee.Status != MeetingAttendeeStatus.Joined)
            {
                var currentlyJoinedCount = await _context.MeetingAttendees
                    .CountAsync(a => a.MeetingId == meetingId && a.Status == MeetingAttendeeStatus.Joined);

                if (currentlyJoinedCount >= 4)
                    throw new MeetingFullException("This meeting is full");
            }

            var wasAlreadyLive = meetingAttendee.Meeting.Status == MeetingStatus.Live;
            var wasReconnecting = meetingAttendee.Status == MeetingAttendeeStatus.Joined;

            meetingAttendee.Status = MeetingAttendeeStatus.Joined;
            meetingAttendee.JoinedAt ??= DateTime.UtcNow;
            meetingAttendee.ConnectionId = connectionId;

            if (!wasAlreadyLive)
            {
                meetingAttendee.Meeting.Status = MeetingStatus.Live;
                meetingAttendee.Meeting.StartedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await _hubContext.Groups.AddToGroupAsync(connectionId, $"meeting-{meetingId}");

            if (wasReconnecting)
            {
                await _hubContext.Clients.GroupExcept($"meeting-{meetingId}", [connectionId]).SendAsync("ParticipantReconnected", userId);
            }
            else
            {
                await _hubContext.Clients.GroupExcept($"meeting-{meetingId}", [connectionId]).SendAsync("ParticipantJoined", userId);
            }

            var otherParticipants = await _context.MeetingAttendees
                .Where(a => a.MeetingId == meetingId && a.Status == MeetingAttendeeStatus.Joined && a.UserId != userId)
                .Select(a => a.UserId)
                .ToListAsync();

            return otherParticipants ?? [];
        }

        public async Task LeaveMeeting(Guid meetingId, string userId, string connectionId)
        {
            var attendee = await _context.MeetingAttendees
                 .Include(a => a.Meeting)
                 .FirstOrDefaultAsync(a => a.MeetingId == meetingId && a.UserId == userId);

            if (attendee is null) return;

            attendee.Status = MeetingAttendeeStatus.Left;
            attendee.LeftAt = DateTime.UtcNow;
            attendee.ConnectionId = null;

            var remainingJoined = await _context.MeetingAttendees
                .CountAsync(a => a.MeetingId == meetingId && a.Status == MeetingAttendeeStatus.Joined && a.UserId != userId);

            if (remainingJoined == 0)
            {
                attendee.Meeting.Status = MeetingStatus.Ended;
                attendee.Meeting.EndedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            await _hubContext.Groups.RemoveFromGroupAsync(connectionId, $"meeting-{meetingId}");
            await _hubContext.Clients.Group($"meeting-{meetingId}").SendAsync("ParticipantLeft", userId);
        }

        public async Task OnConnected(string userId, string connectionId)
        {
            var attendee = await _context.MeetingAttendees
                        .FirstOrDefaultAsync(a => a.ConnectionId == connectionId);

            if (attendee is not null)
            {
                var meetingId = attendee.MeetingId;
                attendee.ConnectionId = null;
                await _context.SaveChangesAsync();
                await _hubContext.Clients.Group($"meeting-{meetingId}")
                    .SendAsync("ParticipantDisconnected", userId);
            }
        }
    }
}
