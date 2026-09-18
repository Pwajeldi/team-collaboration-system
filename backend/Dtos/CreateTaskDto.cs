namespace backend.Dtos
{
    public class CreateTaskDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public required string Priority { get; set; } = string.Empty;
        public required string AssigneeId { get; set; }
    }

    public class UpdateTaskStatusDto
    {
        public string Status {  get; set; } = string.Empty;
    }

    public class TaskResponse
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public int Progress { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public string AssignedById { get; set; } = string.Empty;
        public string AssignedByName { get; set; } = string.Empty;
        public string AssignedToId { get; set; } = string.Empty;
        public string AssignedToName { get; set; } = string.Empty;
    }

    public class UpdateTaskDto
    {
        public required string Title { get; set; }
        public string? Description { get; set; }
        public required string Priority { get; set; }
        public DateTime? DueDate { get; set; }
        public required string AssigneeId { get; set; }
    }

    public class TaskQueryParameters
    {
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? AssigneeId { get; set; }
        public string? Search { get; set; }
    }

    public class AssignableMemberResponse
    {
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
    }

    public class TaskSummaryResponse
    {
        public int TotalTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int InReviewTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int OverdueTasks { get; set; }
    }
}
