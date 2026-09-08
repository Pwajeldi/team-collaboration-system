using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public interface IDashboardService
    {
        Task<ManagerDashboardResponse> GetManagerDashboard(TeamMember user, string userTimeZone);
        Task<EmployeeDashboardResponse> GetRegularDashboard(TeamMember user, string userTimeZone);
        Task<AdminDashboardResponse> GetAdminDashboard(TeamMember user, string userTimeZone);
    }
    public class DashboardService : IDashboardService
    {
        private readonly TeamDbContext _context;

        public DashboardService(TeamDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardResponse> GetAdminDashboard(TeamMember user, string userTimeZone)
        {
            var managerDashboard = await GetManagerDashboard(user, userTimeZone);

            var totalTasks = await _context.Tasks.CountAsync();
            var totalCompletedTasks = await _context.Tasks.CountAsync(t => t.Status == TaskItemStatus.Completed);
            var totalOverdueTasks = await _context.Tasks.CountAsync(t => t.Status == TaskItemStatus.Overdue);
            var totalDepts = await _context.Departments.CountAsync();
            var allMembers = await _context.Users.CountAsync();

            var taskActivities = await BuildTaskActivity();
            var unreadMessageCount = await GetUnreadMessages(user.Id);

            var adminDashboardResponse = new AdminDashboardResponse
            {
                ResponseAsManager = managerDashboard,
                TaskActivity = taskActivities,
                DepartmentCount = totalDepts,
                AllMembersCount = allMembers,
                UnreadMessageCount = unreadMessageCount,
            };

            return adminDashboardResponse;
        }

        public async Task<ManagerDashboardResponse> GetManagerDashboard(TeamMember user, string userTimeZone)
        {
            var firstName = user.FirstName;

            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == user.DepartmentId);
            if (department is null) throw new KeyNotFoundException("Department not found");
            var departmentName = department.DepartmentName;
            var usersInDepartment = await _context.Users.Where(u => u.DepartmentId == department.Id).CountAsync();

            var myTasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.AssignedTo)
                .Where(t => t.AssignedById == user.Id)
                .ToListAsync();
            var inProgressTasks = myTasks.Count(t => t.Status == TaskItemStatus.InProgress);
            var inReviewTasks = myTasks.Count(t => t.Status == TaskItemStatus.InReview);
            var completedTasks = myTasks.Count(t => t.Status == TaskItemStatus.Completed);
            var overdueTasks = myTasks.Count(t => t.Status == TaskItemStatus.Overdue);
            var myTaskCount = myTasks.Count;
            var recentTasks = myTasks.OrderByDescending(t => t.CreatedAt)
                .Take(5).Select(t => new RecentTaskDto
                {
                    Title = t.Title,
                    AssignedToName = $"{t.AssignedTo.FirstName} {t.AssignedTo.LastName}",
                    Priority = t.Priority,
                    Status = t.Status,
                    DueDate = t.DueDate,
                }).ToList();

            var taskSummaryResponse = new TaskSummaryResponse
            {
                TotalTasks = myTaskCount,
                CompletedTasks = completedTasks,
                InProgressTasks = inProgressTasks,
                InReviewTasks = inReviewTasks,
                OverdueTasks = overdueTasks,
            };


            var timezoneOfUser = userTimeZone.Trim();
            if(!TimeZoneInfo.TryFindSystemTimeZoneById(timezoneOfUser, out var userTZinfo))
            {
                userTZinfo = TimeZoneInfo.Utc;
            };
            var utcNow = DateTime.UtcNow;
            var userLocalNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, userTZinfo);
            var userStartOfDay = userLocalNow.Date;
            var userEndOfDay = userLocalNow.AddDays(1);
            var userStartUtc = TimeZoneInfo.ConvertTimeToUtc(userStartOfDay, userTZinfo);
            var userEndUtc = TimeZoneInfo.ConvertTimeToUtc(userEndOfDay, userTZinfo);

            var todayEvents = await _context.Events
                .AsNoTracking()
                .Include(e => e.Attendees)
                .Where(e => (
                    (e.OrganizerId == user.Id) || (e.Attendees.Any(a => a.UserId == user.Id)))
                        && 
                    (e.Start < userEndUtc && e.End > userStartUtc)
                )
                .OrderBy(e => e.Start)
                .Select(e => new DashboardEventResponse
                {
                    Title = e.Title,
                    Start =  e.Start,
                    End = e.End,
                    Location = e.Location,
                })
                .ToListAsync();
            var todayEventsCount = todayEvents.Count;

            var cutoff = DateTime.UtcNow.AddHours(-1);
            var recentMessages = await _context.Messages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Where(m => m.SentAt >= cutoff)
                .OrderByDescending(m => m.SentAt)
                .Take(5)
                .Select(m => new RecentMessageDto
                {  
                    Message = m.Content ?? "",
                    SentAt = m.SentAt,
                    SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                })
                .ToListAsync();

            var recentDepartmentMessages = await _context.DepartmentMessages
                .Include(dm => dm.Sender)
                .Where(dm => dm.DepartmentId == user.DepartmentId && dm.SentAt >= cutoff)
                .OrderByDescending(dm => dm.SentAt)
                .Take(5)
                .Select(dm => new RecentMessageDto
                {
                    Message = dm.Message,
                    SentAt = dm.SentAt,
                    SenderName = $"{dm.Sender.FirstName} {dm.Sender.LastName}",
                })
                .ToListAsync();
            var unreadMessageCount = await GetUnreadMessages(user.Id);

            var managerDashboardResponse = new ManagerDashboardResponse
            {
                FirstName = firstName,
                DepartmentName = departmentName,
                TeamMemberCount = usersInDepartment,
                TeamTaskSummary = taskSummaryResponse,
                EventsTodayCount = todayEventsCount,
                TodayEvents = todayEvents,
                RecentMessages = recentMessages,
                RecentTasks = recentTasks,
                UnreadMessageCount = unreadMessageCount
            };

            return managerDashboardResponse;
        }

        public async Task<EmployeeDashboardResponse> GetRegularDashboard(TeamMember user, string userTimezone)
        {
            var firstName = user.FirstName;

            var department = await _context.Departments.FirstOrDefaultAsync(d => d.Id == user.DepartmentId);
            if (department is null) throw new KeyNotFoundException("Department not found");
            var departmentName = department.DepartmentName;

            var myTasks = await _context.Tasks
                .AsNoTracking()
                .Include(t => t.AssignedBy)
                .Where(t => t.AssignedToId == user.Id)
                .ToListAsync();
            var inProgressTasks = myTasks.Count(t => t.Status == TaskItemStatus.InProgress);
            var inReviewTasks = myTasks.Count(t => t.Status == TaskItemStatus.InReview);
            var completedTasks = myTasks.Count(t => t.Status == TaskItemStatus.Completed);
            var overdueTasks = myTasks.Count(t => t.Status == TaskItemStatus.Overdue);
            var myTaskCount = myTasks.Count;
            var recentTasks = myTasks.OrderByDescending(t => t.CreatedAt)
                .Take(5).Select(t => new RecentTaskDto
                {
                    Title = t.Title,
                    AssignedByName = $"{t.AssignedBy.FirstName} {t.AssignedBy.LastName}",
                    Priority = t.Priority,
                    Status = t.Status,
                    DueDate = t.DueDate,
                }).ToList();

            var taskSummaryResponse = new TaskSummaryResponse
            {
                TotalTasks = myTaskCount,
                CompletedTasks = completedTasks,
                InProgressTasks = inProgressTasks,
                InReviewTasks = inReviewTasks,
                OverdueTasks = overdueTasks,
            };

            var timezoneOfUser = userTimezone.Trim();
            if (!TimeZoneInfo.TryFindSystemTimeZoneById(timezoneOfUser, out var userTZinfo))
            {
                userTZinfo = TimeZoneInfo.Utc;
            }
            ;
            var utcNow = DateTime.UtcNow;
            var userLocalNow = TimeZoneInfo.ConvertTimeFromUtc(utcNow, userTZinfo);
            var userStartOfDay = userLocalNow.Date;
            var userEndOfDay = userLocalNow.AddDays(1);
            var userStartUtc = TimeZoneInfo.ConvertTimeToUtc(userStartOfDay, userTZinfo);
            var userEndUtc = TimeZoneInfo.ConvertTimeToUtc(userEndOfDay, userTZinfo);

            var todayEvents = await _context.Events
                .AsNoTracking()
                .Include(e => e.Attendees)
                .Where(e => (
                    (e.OrganizerId == user.Id) || (e.Attendees.Any(a => a.UserId == user.Id)))
                        &&
                    (e.Start < userEndUtc && e.End > userStartUtc)
                )
                .OrderBy(e => e.Start)
                .Select(e => new DashboardEventResponse
                {
                    Title = e.Title,
                    Start = e.Start,
                    End = e.End,
                    Location = e.Location,
                })
                .ToListAsync();
            var todayEventsCount = todayEvents.Count;

            var cutoff = DateTime.UtcNow.AddHours(-1);
            var recentMessages = await _context.Messages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Where(m => m.SentAt >= cutoff)
                .OrderByDescending(m => m.SentAt)
                .Take(5)
                .Select(m => new RecentMessageDto
                {
                    Message = m.Content ?? "",
                    SentAt = m.SentAt,
                    SenderName = $"{m.Sender.FirstName} {m.Sender.LastName}",
                })
                .ToListAsync();

            var recentDepartmentMessages = await _context.DepartmentMessages
                .Include(dm => dm.Sender)
                .Where(dm => dm.DepartmentId == user.DepartmentId && dm.SentAt >= cutoff)
                .OrderByDescending(dm => dm.SentAt)
                .Take(5)
                .Select(dm => new RecentMessageDto
                {
                    Message = dm.Message,
                    SentAt = dm.SentAt,
                    SenderName = $"{dm.Sender.FirstName} {dm.Sender.LastName}",
                })
                .ToListAsync();
            var unreadMessageCount = await GetUnreadMessages(user.Id);

            var regularDashboardResponse = new EmployeeDashboardResponse
            {
                FirstName = firstName,
                DepartmentName = departmentName,
                TaskSummary = taskSummaryResponse,
                EventsTodayCount = todayEventsCount,
                TodayEvents = todayEvents,
                RecentMessages = recentMessages,
                RecentTasks = recentTasks,
                UnreadMessageCount = unreadMessageCount,
            };

            return regularDashboardResponse;
        }

        private async Task<List<TaskActivityDto>> BuildTaskActivity()
        {
            var today = DateTime.UtcNow.Date;
            var rangeStart = today.AddDays(-6);
            var rangeEnd = today.AddDays(1); 

            var relevantTasks = await _context.Tasks
                .Where(t =>
                    (t.CreatedAt >= rangeStart && t.CreatedAt < rangeEnd) ||
                    (t.DueDate != null && t.DueDate >= rangeStart && t.DueDate < rangeEnd) ||
                    (t.CompletedAt != null && t.CompletedAt >= rangeStart && t.CompletedAt < rangeEnd))
                .Select(t => new { t.CreatedAt, t.DueDate, t.CompletedAt })
                .ToListAsync();

            var activity = new List<TaskActivityDto>();

            for (var day = rangeStart; day <= today; day = day.AddDays(1))
            {
                var dayEnd = day.AddDays(1);

                activity.Add(new TaskActivityDto
                {
                    Date = day,
                    Created = relevantTasks.Count(t => t.CreatedAt >= day && t.CreatedAt < dayEnd),
                    Due = relevantTasks.Count(t => t.DueDate != null && t.DueDate >= day && t.DueDate < dayEnd),
                    Completed = relevantTasks.Count(t => t.CompletedAt != null && t.CompletedAt >= day && t.CompletedAt < dayEnd),
                });
            }

            return activity;
        }

        private async Task<int> GetUnreadMessages(string userId)
        {
            var unreadMessageCount = await _context.Messages.Where(m => m.RecipientId == userId && !m.isRead).CountAsync();
            return unreadMessageCount;
        }
    }
}
