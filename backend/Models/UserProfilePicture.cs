namespace backend.Models
{
    public class UserProfilePicture
    {
        public long Id { get; set; }
        public string? UserId { get; set; }
        public TeamMember? User { get; set; }
        public string BlobName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
    }
}
