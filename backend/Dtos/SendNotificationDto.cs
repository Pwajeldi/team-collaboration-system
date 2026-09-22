using backend.Data;
using backend.Models;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class SendNotificationDto
    {
        [Required] public string Title { get; set; } = string.Empty;
        [Required] public string Message { get; set; } = string.Empty;
        [Required] public string Type { get; set; } = NotificationType.Info;
        public IFormFile? Attachment {  get; set; }
    }

    public class NotificationResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
        public string? AttachmentFileName { get; set; }
        public string? AttachmentBlobName { get; set; }
        public string? AttachmentContentType { get; set; }
        public long? AttachmentFileSizeBytes { get; set; }
    }
}
