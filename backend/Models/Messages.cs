namespace backend.Models
{
    public class Messages
    {
        public long Id { get; set; }
        public string? SenderId { get; set; } = string.Empty;
        public string? RecipientId { get; set; } = string.Empty;
        public TeamMember? Sender { get; set; } = null!;
        public TeamMember? Recipient { get; set; } = null!;
        public string? Content { get; set; } = string.Empty;
        public ICollection<MessageAttachment> Attachments { get; set; } = new List<MessageAttachment>();
        public DateTime SentAt { get; set; }
        public DateTime ReadAt { get; set; }
        public bool IsDeletedBySender { get; set; }
        public bool IsDeletedByRecipient { get; set; }
        public bool IsDelivered { get; set; } = false;
        public bool IsRead { get; set; } = false;
    }
}
