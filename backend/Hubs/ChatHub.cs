using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;

namespace backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IConnectionManager _connectionManager;
        private readonly TeamDbContext _teamDbContext;
        private readonly UserManager<TeamMember> _userManager;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(IConnectionManager connectionManager, ILogger<ChatHub> logger, TeamDbContext teamDbContext, UserManager<TeamMember> userManager)
        {
            _connectionManager = connectionManager;
            _teamDbContext = teamDbContext;
            _userManager = userManager;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var memberId = Context.UserIdentifier ?? throw new Exception("Unable to connect user");
            try
            {
                var connectionId = Context.ConnectionId.ToString();
                
                if (string.IsNullOrWhiteSpace(memberId))
                {
                    Context.Abort();
                    return;
                }
                var member = await _userManager.FindByIdAsync(memberId);
                if (member is null)
                {
                    Context.Abort();
                    return;
                }
                var deptId = member!.DepartmentId;
                await Groups.AddToGroupAsync(connectionId, $"dept-{deptId}");
                var wasAlreadyOnline = _connectionManager.GetConnections(memberId).Any();
                _connectionManager.AddConnection(memberId!, connectionId);

                var undeliveredMessages = await _teamDbContext.Messages.Where(m => m.RecipientId == memberId && !m.IsDelivered).ToListAsync();
                foreach(var message in undeliveredMessages)
                {
                    message.IsDelivered = true;
                }
                await _teamDbContext.SaveChangesAsync();

                await base.OnConnectedAsync();

                if (!wasAlreadyOnline)
                {
                    await Clients.Others.SendAsync("UserOnline", memberId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occured while disconnecting from the hub: User-{UserId}", memberId);
                return;
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var memberId = Context.UserIdentifier;
            try
            {
                var connectionId = Context.ConnectionId.ToString();           
                if (!string.IsNullOrWhiteSpace(memberId))
                {
                    var member = await _userManager.FindByIdAsync(memberId);
                    if (member is not null)
                    {
                        var deptId = member!.DepartmentId;
                        await Groups.RemoveFromGroupAsync(connectionId, $"dept-{deptId}");
                    }
                    var isLastConnection = _connectionManager.RemoveConnection(memberId!, connectionId);
                    if (isLastConnection)
                    {
                        await Clients.Others.SendAsync("UserOffline", memberId);
                    }
                }
            }
            catch(Exception ex)
            {
                _logger.LogError(ex,"Error occured while disconnecting from the hub: User-{UserId}", memberId);
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendDirectMessage(string recipientId, string message, long? attachmentId)
        {
            if (string.IsNullOrWhiteSpace(message) && !attachmentId.HasValue) return;
            var callerId = Context.UserIdentifier;
            if (callerId is null) return;
            var messageMyself = callerId == recipientId;

            if (messageMyself)
            {
                MessageAttachment? attachment = null;
                if (attachmentId.HasValue)
                {
                    attachment = await _teamDbContext.MessageAttachments.FindAsync(attachmentId.Value);
                    if (attachment is null || attachment.MessageId is not null)
                    {
                        attachment = null;
                    }
                }

                var newMessage = new Messages
                {
                    SenderId = callerId,
                    RecipientId = recipientId,
                    Content = message,
                    SentAt = DateTime.UtcNow,
                    IsDelivered = true,
                    IsRead = true,
                };

                await _teamDbContext.Messages.AddAsync(newMessage);
                await _teamDbContext.SaveChangesAsync();

                if (attachment is not null)
                {
                    attachment.MessageId = newMessage.Id;
                    await _teamDbContext.SaveChangesAsync();
                }
                var caller = await _teamDbContext.Users.FirstOrDefaultAsync(u => u.Id == callerId);
                var callerName = $"{caller!.FirstName} {caller.LastName}";

                var messageResponse = new MessageResponse
                {
                    MessageId = newMessage.Id,
                    RecipientId = newMessage.RecipientId,
                    SenderId = newMessage.SenderId,
                    Content = newMessage.Content,
                    SentDate = newMessage.SentAt,
                    IsDelivered = true,
                    IsRead = true,
                    Attachments = attachment is not null ? new List<AttachmentResponse>
                        {
                            new AttachmentResponse
                            {
                                Id = attachment.Id,
                                BlobName = attachment.BlobName,
                                FileName = attachment.FileName,
                                ContentType = attachment.ContentType,
                                FileSizeBytes = attachment.FileSizeBytes,
                            }
                        }
                        : [],
                };
                await Clients.Caller.SendAsync("ReceiveMyMessage", messageResponse);
            }
            else
            {
                var recipient = await _userManager.FindByIdAsync(recipientId);

                if (!string.IsNullOrWhiteSpace(callerId) && recipient != null)
                {
                    var isRecepientOnline = _connectionManager.GetConnections(recipientId).Any();

                    MessageAttachment? attachment = null;
                    if (attachmentId.HasValue)
                    {
                        attachment = await _teamDbContext.MessageAttachments.FindAsync(attachmentId.Value);
                        if (attachment is null || attachment.MessageId is not null)
                        {
                            attachment = null;
                        }
                    }

                    var newMessage = new Messages
                    {
                        SenderId = callerId,
                        RecipientId = recipientId,
                        Content = message,
                        SentAt = DateTime.UtcNow,
                        IsDelivered = isRecepientOnline,
                    };

                    await _teamDbContext.Messages.AddAsync(newMessage);
                    await _teamDbContext.SaveChangesAsync();

                    if (attachment is not null)
                    {
                        attachment.MessageId = newMessage.Id;
                        await _teamDbContext.SaveChangesAsync();
                    }
                    var caller = await _teamDbContext.Users.FirstOrDefaultAsync(u => u.Id == callerId);
                    var callerName = $"{caller!.FirstName} {caller.LastName}";

                    var messageResponse = new MessageResponse
                    {
                        MessageId = newMessage.Id,
                        SenderId = newMessage.SenderId,
                        SenderName = callerName,
                        RecipientId = newMessage.RecipientId,
                        Content = newMessage.Content,
                        SentDate = newMessage.SentAt,
                        IsDelivered = newMessage.IsDelivered,
                        Attachments = attachment is not null ? new List<AttachmentResponse>
                        {
                            new AttachmentResponse
                            {
                                Id = attachment.Id,
                                BlobName = attachment.BlobName,
                                FileName = attachment.FileName,
                                ContentType = attachment.ContentType,
                                FileSizeBytes = attachment.FileSizeBytes,
                            }
                        }
                            : [],
                    };
                    await Clients.Caller.SendAsync("ReceiveMessage", messageResponse);
                    await Clients.User(recipientId).SendAsync("ReceiveMessage", messageResponse);
                }
            }
        }

        public async Task SendDepartmentMessage(string message, long? attachmentId)
        {
            if (string.IsNullOrWhiteSpace(message) && !attachmentId.HasValue) return;
            var callerId = Context.UserIdentifier ?? throw new Exception("UserId not found");
            var member = await _userManager.FindByIdAsync(callerId);
            if(member is null) { throw new Exception("User not Found"); }
            var deptId = member!.DepartmentId;

            MessageAttachment? attachment = null;
            if (attachmentId.HasValue)
            {
                attachment = await _teamDbContext.MessageAttachments.FindAsync(attachmentId.Value);
                if (attachment is null || attachment.MessageId is not null)
                {
                    attachment = null;
                }
            }
            var departmentMembers = await _teamDbContext.Users.Where(u => u.DepartmentId == deptId).Select(u => u.Id).ToListAsync();
            var anyMemberOnline = _connectionManager.IsAnyDepartmentMemberOnline(departmentMembers);

            var newMessage = new DepartmentMessage
            {
                SenderId = callerId,
                DepartmentId = deptId,
                Message = message,
                SentAt = DateTime.UtcNow,
                IsDelivered = anyMemberOnline,
            };
            await _teamDbContext.DepartmentMessages.AddAsync(newMessage);
            await _teamDbContext.SaveChangesAsync();
            if (attachment is not null)
            {
                attachment.DepartmentMessageId = newMessage.Id;
                await _teamDbContext.SaveChangesAsync();
            }
            var departmentMessageResponse = new DepartmentMessageResponse
            {
                MessageId = newMessage.Id,
                SenderId = newMessage.SenderId,
                SenderName = $"{member.FirstName} {member.LastName}",
                Content = newMessage.Message,
                SentDate = newMessage.SentAt,
                Attachments = attachment is not null ? new List<AttachmentResponse>
                        {
                            new AttachmentResponse
                            {
                                Id = attachment.Id,
                                BlobName = attachment.BlobName,
                                FileName = attachment.FileName,
                                ContentType = attachment.ContentType,
                                FileSizeBytes = attachment.FileSizeBytes,
                            }
                        }
                        : [],
            };
            await Clients.Group($"dept-{deptId}").SendAsync("ReceiveDepartmentMessage", departmentMessageResponse);
        }

        public async Task MarkAsRead(string senderId)
        {
            var currentUserId = Context.UserIdentifier;
            if (currentUserId is null) return;
            var unreadMessages = await _teamDbContext.Messages
                .Where(m => m.SenderId == senderId && m.RecipientId == currentUserId && !m.IsRead).ToListAsync();
            if (unreadMessages.Count == 0)
                return;
            foreach(var unreadMessage in unreadMessages)
            {
                unreadMessage.IsRead = true;
            }
            await _teamDbContext.SaveChangesAsync();
            await Clients.User(senderId).SendAsync("MessagesRead", unreadMessages.Select(m => m.Id).ToList());
            await Clients.Caller.SendAsync("ClearUnreadBadge");
        }

        public async Task ReadDepartmentMessage(string senderId)
        {
            var currentUserId = Context.UserIdentifier;
            if (currentUserId is null) return;
            var currentUser = await _userManager.FindByIdAsync(currentUserId);
            var unreadMessages = await _teamDbContext.DepartmentMessages
                .Where(m => m.SenderId == senderId && m.DepartmentId == currentUser!.DepartmentId && !m.IsRead).ToListAsync();
            if (unreadMessages.Count == 0)
                return;
            foreach (var unreadMessage in unreadMessages)
            {
                unreadMessage.IsRead = true;
            }
            await _teamDbContext.SaveChangesAsync();
            await Clients.User(senderId).SendAsync("DepartmentMessagesRead", unreadMessages.Select(m => m.Id).ToList());
            await Clients.Caller.SendAsync("ClearUnreadDepartmentMessageBadge");
        }
    }
}
