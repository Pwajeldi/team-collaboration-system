namespace backend.Models
{
    public class Department
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string? ManagerId { get; set; }
        public TeamMember? DepartmentManager { get; set; }
        public ICollection<TeamMember> Members { get; set; } = [];
        public ICollection<DepartmentMessage> Messages { get; set; } = [];
    }

    public class DepartmentMessage
    {
        public long Id { get; set; }
        public string? SenderId { get; set; }
        public TeamMember? Sender { get; set; }
        public int DepartmentId { get; set; }
        public Department Department { get; set; } = null!;
        public string Message { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
        public ICollection<MessageAttachment> DepartmentAttachments { get; set; } = [];
        public bool IsDelivered { get; set; } = false;
        public bool IsRead { get; set; } = false;
    }
}
