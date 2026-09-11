using backend.Models;

namespace backend.Dtos
{
    public class CreateEventDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public required DateTime Start { get; set; }
        public required DateTime End { get; set; }
        public required List<string> AttendeeIds { get; set; }
        public bool IsMeeting { get; set; } = false;
    }

    public class AttendeeResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public bool HadOverlapAtCreation { get; set; }
        public InvitationStatus Status { get; set; }
    }

    public class EventResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string OrganizerName { get; set; } = string.Empty;
        public string OrganizerId { get; set; } = string.Empty;
        public List<AttendeeResponse> Attendees { get; set; } = new();
        public bool IsMeeting { get; set; }
        public Guid? MeetingId { get; set; }
        public string? MeetingStatus { get; set; }
    }
}
