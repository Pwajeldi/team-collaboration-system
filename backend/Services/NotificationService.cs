using backend.Data;
using backend.Dtos;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface INotificationService
    {
        Task<NotificationResponseDto> AddNewNotification(SendNotificationDto dto, string senderId);
        Task<List<NotificationResponseDto>> GetMyNotifications(string userId);
        Task MarkAsRead(Guid notificationId, string userId);
    }

    public class NotificationService : INotificationService
    {
        private readonly TeamDbContext _context;
        private readonly UserManager<TeamMember> _userManager;
        private readonly IFileStorageService _fileStorageService;
        private readonly IHubContext<ChatHub> _hub;

        public NotificationService(
            TeamDbContext context,
            UserManager<TeamMember> userManager,
            IFileStorageService fileStorageService,
            IHubContext<ChatHub> hub)
        {
            _context = context;
            _userManager = userManager;
            _fileStorageService = fileStorageService;
            _hub = hub;
        }

        public async Task<NotificationResponseDto> AddNewNotification(SendNotificationDto dto, string senderId)
        {
            var sender = await _userManager.FindByIdAsync(senderId)
                ?? throw new KeyNotFoundException("Sender not found");

            if (!NotificationType.AllowedNotificationTypes.Contains(dto.Type.ToLowerInvariant()))
            {
                throw new InvalidOperationException("Type of notification is invalid");
            }

            var notification = new Notification
            {
                CreatedById = senderId,
                Title = dto.Title.Trim(),
                Message = dto.Message.Trim(),
                Type = dto.Type,
            };

            if (dto.Attachment is not null && dto.Attachment.Length > 0)
            {
                using var stream = dto.Attachment.OpenReadStream();
                var blobName = await _fileStorageService.UploadAsync(stream, dto.Attachment.FileName, dto.Attachment.ContentType);
                notification.AttachmentBlobName = blobName;
                notification.AttachmentFileName = dto.Attachment.FileName;
                notification.AttachmentContentType = dto.Attachment.ContentType;
                notification.AttachmentFileSizeBytes = dto.Attachment.Length;
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            var recipientIds = await _userManager.Users
                .Where(u => u.IsActive)
                .Select(u => u.Id)
                .ToListAsync();

            var userNotifications = recipientIds.Select(uid => new UserNotification
            {
                NotificationId = notification.Id,
                UserId = uid,
                IsRead = uid == senderId,
            }).ToList();

            _context.UserNotifications.AddRange(userNotifications);
            await _context.SaveChangesAsync();

            var response = new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                Type = notification.Type,
                CreatedByName = $"{sender.FirstName} {sender.LastName}",
                CreatedAt = notification.CreatedAt,
                IsRead = false,
                AttachmentFileName = notification.AttachmentFileName,
                AttachmentBlobName = notification.AttachmentBlobName,
                AttachmentContentType = notification.AttachmentContentType,
                AttachmentFileSizeBytes = notification.AttachmentFileSizeBytes,
            };

            await _hub.Clients.All.SendAsync("ReceiveNotification", response);

            return response;
        }

        public async Task<List<NotificationResponseDto>> GetMyNotifications(string userId)
        {
            return await _context.UserNotifications
                .Where(un => un.UserId == userId)
                .OrderByDescending(un => un.Notification.CreatedAt)
                .Take(50) // simple recency cap, not cursor-paginated — matches the announcements endpoint's scope
                .Select(un => new NotificationResponseDto
                {
                    Id = un.Notification.Id,
                    Title = un.Notification.Title,
                    Message = un.Notification.Message,
                    Type = un.Notification.Type,
                    CreatedByName = un.Notification.CreatedBy.FirstName + " " + un.Notification.CreatedBy.LastName,
                    CreatedAt = un.Notification.CreatedAt,
                    IsRead = un.IsRead,
                    AttachmentFileName = un.Notification.AttachmentFileName,
                    AttachmentBlobName = un.Notification.AttachmentBlobName,
                    AttachmentContentType = un.Notification.AttachmentContentType,
                    AttachmentFileSizeBytes = un.Notification.AttachmentFileSizeBytes,
                })
                .ToListAsync();
        }

        public async Task MarkAsRead(Guid notificationId, string userId)
        {
            var row = await _context.UserNotifications
                .FirstOrDefaultAsync(un => un.NotificationId == notificationId && un.UserId == userId);

            if (row is null || row.IsRead) return; // idempotent — repeat clicks are cheap no-ops

            row.IsRead = true;
            row.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
