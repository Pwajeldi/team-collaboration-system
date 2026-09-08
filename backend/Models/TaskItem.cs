using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class TaskItem
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string AssignedById { get; set; } = string.Empty; // FK -> TeamMember (the manager/admin)
        public TeamMember AssignedBy { get; set; } = null!;

        public string AssignedToId { get; set; } = string.Empty; // FK -> TeamMember (the assignee)
        public TeamMember AssignedTo { get; set; } = null!;

        public string Status { get; set; } = TaskItemStatus.NotStarted;
        public string Priority { get; set; } = TaskPriority.Medium;
        [Range(0,100, ErrorMessage = "Progress must be between o and 100")]
        public int Progress { get; set; } = 0;

        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastUpdated {  get; set; }
        public DateTime? CompletedAt { get; set; }
    }

    public static class TaskItemStatus
    {
        public const string NotStarted = "NotStarted";
        public const string InProgress = "InProgress";
        public const string InReview = "InReview";
        public const string Blocked = "Blocked";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
        public const string Overdue = "Overdue";
    }

    public static class TaskPriority
    {
        public const string Low = "Low";
        public const string Medium = "Medium";
        public const string High = "High";
    }
}