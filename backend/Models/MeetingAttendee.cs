namespace backend.Models
{
    public class MeetingAttendee
    {
        public Guid Id { get; set; }
        public Guid MeetingId { get; set; }
        public Meeting Meeting { get; set; } = null!;
        public string UserId { get; set; } = string.Empty;
        public TeamMember User { get; set; } = null!;
        public string Status { get; set; } = MeetingAttendeeStatus.NotJoined;
        public DateTime? JoinedAt { get; set; }
        public DateTime? LeftAt { get; set; }
        public string? ConnectionId { get; set; }
    }

    public static class MeetingAttendeeStatus
    {
        public const string NotJoined = "NotJoined";
        public const string Joined = "Joined";
        public const string Left = "Left";
    }
}
