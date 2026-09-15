namespace backend.Dtos
{
    public class MessageResponse
    {
        public long MessageId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public string? SenderId { get; set; } = string.Empty;
        public string? RecipientId { get; set; } = string.Empty;
        public string? SenderName {  get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public bool IsDelivered { get; set; }
        public List<AttachmentResponse> Attachments { get; set; } = [];
        public bool IsDeleted { get; set; }
    }

    public class DepartmentMessageResponse
    {
        public long MessageId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime SentDate { get; set; }
        public string? SenderId { get; set; }
        public string? SenderName { get; set; }
        public List<AttachmentResponse> Attachments { get; set; } = [];
        public bool IsRead { get; set; }
        public bool IsDelivered { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class GetDepartmentResponse
    {
        public int DepartmentId { get; set; }
        public required string DepartmentName { get; set; }
    }

    public class AttachmentResponse
    {
        public long Id { get; set; }
        public string BlobName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
    }
}
