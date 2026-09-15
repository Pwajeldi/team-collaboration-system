namespace backend.Models
{
    public class Meeting
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid? EventId { get; set; } // our FK to Event
        public Event Event { get; set; } = null!;
        public string HostId { get; set; } = string.Empty;
        public TeamMember Host { get; set; } = null!;
        public string Status { get; set; } = MeetingStatus.Scheduled;
        public DateTime? StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<MeetingAttendee> Attendees { get; set; } = new List<MeetingAttendee>();
    }

    public static class MeetingStatus
    {
        public const string Scheduled = "Scheduled";
        public const string Live = "Live";
        public const string Ended = "Ended";
    }
}
