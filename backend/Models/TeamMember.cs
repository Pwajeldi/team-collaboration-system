using Microsoft.AspNetCore.Identity;

namespace backend.Models
{
    public class TeamMember : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        public DateTime DateJoined { get; set; }
        public Department Department { get; set; } = null!;
        public int DepartmentId { get; set; }
        public string? ProfilePictureBlobName { get; set; }
        public UserProfilePicture? ProfilePicture { get; set; }
        public bool IsActive { get; set; }
        public RefreshToken? RefreshToken { get; set; }
        public ICollection<Messages> SentMessages { get; set; } = [];
        public ICollection<DepartmentMessage> DepartmentMessagesSent { get; set; } = null!;
        public ICollection<Messages> ReceivedMessages { get; set; } = [];
        public ICollection<Event> Events { get; set; } = [];
        public ICollection<MeetingAttendee> MeetingAttendees { get; set; } = [];
        public ICollection<Meeting> HostedMeetings { get; set; } = [];
        public UserProfile UserProfile { get; set; } = null!;
    }

    public class RefreshToken
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? UserId { get; set; } = string.Empty;
        public TeamMember Member { get; set; } = null!;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public DateTime Created { get; set; }
        public bool Revoked { get; set; }
    }
}
