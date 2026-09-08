namespace backend.Models
{
    public class MessageAttachment
    {
        public long Id { get; set; }
        public long? MessageId { get; set; }
        public Messages? Message { get; set; }
        public string BlobName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
    }
}
