using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class calendarController : ControllerBase
    {
        private readonly UserManager<TeamMember> _userManager;
        private readonly ICalendarService _calendar;

        public calendarController(ICalendarService calendar, UserManager<TeamMember> userManager)
        {
            _userManager = userManager;
            _calendar = calendar;
        }

        [HttpGet("events/{id}")]
        public async Task<IActionResult> GetEvent(Guid id)
        {
            try
            {
                var eventEntity = await _calendar.GetEvent(id);
                return Ok(MapToResponse(eventEntity));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }  
        }

        [HttpGet("events")]
        public async Task<IActionResult> GetEvents()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null)
                return Unauthorized("null_user");
            try
            {
                var myEvents = await _calendar.GetEvents(user);
                return Ok(myEvents);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }    
        }

        [HttpPost("events/create")]
        public async Task<IActionResult> CreateEvent(CreateEventDto dto)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if(currentUserId is null)
            {
                return Unauthorized();
            }
            try
            {
                var newEvent = await _calendar.CreateEvent(dto, currentUserId);
                return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, MapToResponse(newEvent));
            }
            catch(InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("event/update")]
        public async Task<IActionResult> UpdateEvent(UpdateEventDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null) return Unauthorized();
            try
            {
                var updatedEvent = await _calendar.UpdateEvent(dto, user);
                return Ok(MapToResponse(updatedEvent));
            }
            catch(KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (DbUpdateException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (OperationCanceledException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("update-duration")]
        public async Task<IActionResult> UpdateEventTime(UpdateEventDurationDto dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if(userId is null) return Unauthorized();
                await _calendar.UpdateEventDuration(dto, userId);
                return Ok("Event schedule updated successfully");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("events/delete/{eventId}")]
        public async Task<IActionResult> CancelEvent(Guid eventId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();
            try
            {
                await _calendar.DeleteEvent(eventId, userId);
                return NoContent();
            }
            catch(KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch(UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private async Task<EventResponse> MapToResponse(Event eventEntity)
        {
            var firstName = eventEntity.Organizer?.FirstName;
            var lastName = eventEntity.Organizer?.LastName;
            return new EventResponse
            {
                Id = eventEntity.Id,
                Title = eventEntity.Title,
                Description = eventEntity.Description,
                Location = eventEntity.Location,
                Start = eventEntity.Start,
                End = eventEntity.End,
                OrganizerName = $"{firstName} {lastName}" ?? string.Empty,
                OrganizerId = eventEntity.OrganizerId ?? "",
                Attendees = [.. eventEntity.Attendees.Select(a => new AttendeeResponse
                {
                    UserId = a.UserId,
                    FullName = $"{a.User?.FirstName} {a.User?.FirstName}" ?? string.Empty,
                    HadOverlapAtCreation = a.HadOverlapAtCreation,
                    Status = a.Status,
                })],
                IsMeeting = eventEntity.IsMeeting,
                MeetingId = eventEntity.EventMeetingId,
                MeetingStatus = eventEntity.Meeting != null ? eventEntity.Meeting.Status : null,
            };
        }
    }
}
