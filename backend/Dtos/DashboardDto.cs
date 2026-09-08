using backend.Models;
using System.Globalization;

namespace backend.Dtos
{

    public class UpcomingEventDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public string? Location { get; set; }
    }

    public class DashboardTaskItemDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
    }

    public class RecentMessageDto
    {
        public string Message { get; set; } = string.Empty;
        public string SenderName { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class AdminDashboardResponse
    {
        public ManagerDashboardResponse ResponseAsManager { get; set; } = null!;
        public List<TaskActivityDto> TaskActivity { get; set; } = [];
        public List<DepartmentWorkLoadDto> DepartmentWorkload { get; set; } = [];
        public int AllMembersCount { get; set; }
        public int DepartmentCount { get; set; }
        public int UnreadMessageCount { get; set; }
    }

    public class TaskActivityDto
    {
        public DateTime Date { get; set; }
        public int Created { get; set; }
        public int Due { get; set; }
        public int Completed { get; set; }
    }

    public class DepartmentWorkLoadDto
    {

    }

    public class EmployeeDashboardResponse
    {
        public string FirstName { get; set; } = string.Empty;
        public string DepartmentName { get; set;  } = string.Empty;
        public TaskSummaryResponse TaskSummary { get; set; } = new();
        public int EventsTodayCount { get; set; }
        public List<DashboardEventResponse> TodayEvents { get; set; } = [];
        public List<RecentMessageDto> RecentMessages { get; set; } = [];
        public List<RecentTaskDto> RecentTasks { get; set; } = [];

        public int UnreadMessageCount { get; set; }
    }

    public class ManagerDashboardResponse
    {
        public string FirstName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public int TeamMemberCount { get; set; }
        public TaskSummaryResponse TeamTaskSummary { get; set; } = new();
       // public List<StatusCountDto> TasksByStatus { get; set; } = []; // for the donut
        public int EventsTodayCount { get; set; }
        public List<DashboardEventResponse> TodayEvents { get; set; } = [];
        public List<RecentMessageDto> RecentMessages { get; set; } = [];
        public List<RecentTaskDto> RecentTasks { get; set; } = [];
        public int UnreadMessageCount { get; set; }
    }

    public class DashboardSummaryDto
    {
        public int TotalTasks { get; set; }
        public int InProgressTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int UpcomingEventsToday { get; set; }
    }

    public class RecentTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public DateTime? DueDate { get; set; }
        public string AssignedToName { get; set; } = string.Empty;
        public string AssignedByName {  get; set; } = string.Empty;
    }

    public class DashboardEventResponse
    {
        public string Title { get; set; } = string.Empty;
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string? Location { get; set; }
    }
}
