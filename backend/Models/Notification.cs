using backend.Data;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Notification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string CreatedById { get; set; } = string.Empty;
        public TeamMember CreatedBy { get; set; } = null!;
        [MaxLength(100)][Required] public string Title { get; set; } = string.Empty;
        [MaxLength(2000)][Required] public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = NotificationType.Info;
        public string? AttachmentBlobName { get; set; }
        public string? AttachmentFileName { get; set; }
        public string? AttachmentContentType { get; set; }
        public long? AttachmentFileSizeBytes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();
    }

    public class UserNotification
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid NotificationId { get; set; }
        public Notification Notification { get; set; } = null!;
        public string UserId { get; set; } = string.Empty;
        public TeamMember User { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
    }

    public static class NotificationType
    {
        public const string Info = "info";
        public const string Warning = "warning";
        public const string Announcement = "announcement";
        public const string Important = "important";

        public static string[] AllowedNotificationTypes = [Info, Warning, Announcement, Important];
    }
}
