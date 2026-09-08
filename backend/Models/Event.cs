namespace backend.Models
{
    public class Event
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Location { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string OrganizerId { get; set; } = string.Empty; // FK -> User
        public TeamMember Organizer { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool NotificationsSent { get; set; } = false; // background job checkpoint — see below
        public ICollection<EventAttendee> Attendees { get; set; } = new List<EventAttendee>();
        public Meeting? Meeting { get; set; }
        public bool IsMeeting { get; set; }
        public Guid? EventMeetingId { get; set; }
    }

    public class EventAttendee
    {
        public Guid Id { get; set; }
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;
        public string UserId { get; set; } = string.Empty; // FK -> User
        public TeamMember User { get; set; } = null!;
        public bool HadOverlapAtCreation { get; set; } = false; // snapshot, not live-checked later
        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    }

    public enum InvitationStatus
    {
        Pending,
        Accepted,
        Declined,
    }
}
