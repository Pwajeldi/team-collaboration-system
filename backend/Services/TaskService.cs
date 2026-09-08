using backend.Data;
using backend.Dtos;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit.Encodings;

namespace backend.Services
{
    public interface ITaskService
    {
        Task<TaskItem> CreateTask(CreateTaskDto dto, TeamMember currentUser);
        Task<TaskItem> GetTask(Guid id, TeamMember currentUser);
        Task<List<TaskItem>> GetTasks(TaskQueryParameters query, TeamMember currentUser);
        Task<TaskSummaryResponse> GetTaskSummary(TeamMember user);
        Task<TaskItem> UpdateTask(Guid id, UpdateTaskDto dto, TeamMember currentUser);
        Task UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusDto dto, TeamMember currentUser);
        Task DeleteTask(Guid id, TeamMember currentUser);
        Task<List<AssignableMemberResponse>> GetAssignableMembers(TeamMember user);
    }
    public class TaskService : ITaskService
    {
        private readonly UserManager<TeamMember> _userManager;
        private readonly TeamDbContext _context;
        private static readonly Dictionary<(string from, string to), string[]> AllowedTransitions = new()
        {
            [(TaskItemStatus.NotStarted, TaskItemStatus.InProgress)] = ["Assignee"],
            [(TaskItemStatus.InProgress, TaskItemStatus.InReview)] = ["Assignee"],
            [(TaskItemStatus.InReview, TaskItemStatus.InProgress)] = ["Manager", "Admin"],
            [(TaskItemStatus.InReview, TaskItemStatus.Completed)] = ["Manager", "Admin"],
            [(TaskItemStatus.InProgress, TaskItemStatus.Blocked)] = ["Assignee"],
            [(TaskItemStatus.Blocked, TaskItemStatus.InProgress)] = ["Assignee"],
        };
        private static readonly HashSet<string> ValidStatuses =
        [
            TaskItemStatus.NotStarted, TaskItemStatus.InProgress, TaskItemStatus.Blocked,
            TaskItemStatus.Completed, TaskItemStatus.InReview
        ];
        private static readonly HashSet<string> ValidPriorities = [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];

        public TaskService(UserManager<TeamMember> userManager, TeamDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<TaskItem> CreateTask(CreateTaskDto dto, TeamMember currentUser)
        {

            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("Title is required.");

            if (!ValidPriorities.Contains(dto.Priority))
                throw new InvalidOperationException($"'{dto.Priority}' is not a recognized priority.");

            var assignee = await _userManager.FindByIdAsync(dto.AssigneeId) 
                ?? throw new KeyNotFoundException("The user you wish to assign does not exist");

            var isAdmin = await _userManager.IsInRoleAsync(currentUser, Roles.Admin);

            if (!isAdmin && assignee.DepartmentId != currentUser.DepartmentId)
                throw new UnauthorizedAccessException("You do not have permission");

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                Priority = dto.Priority,
                Status = TaskItemStatus.NotStarted,
                DueDate = dto.DueDate,
                AssignedById = currentUser.Id,
                AssignedToId = dto.AssigneeId,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            var savedTask = await _context.Tasks
                .Include(t => t.AssignedBy)
                .Include(t => t.AssignedTo)
                .FirstAsync(t => t.Id == task.Id);
            return savedTask;
        }

        public async Task DeleteTask(Guid id, TeamMember currentUser)
        {
            var task = await _context.Tasks
                 .Include(t => t.AssignedTo)
                 .FirstOrDefaultAsync(t => t.Id == id) ?? throw new KeyNotFoundException("Task does not exist");
            var isAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");

            if (!isAdmin && task.AssignedTo.DepartmentId != currentUser.DepartmentId)
                throw new UnauthorizedAccessException("Access Denied");

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AssignableMemberResponse>> GetAssignableMembers(TeamMember user)
        {
            var isAdmin = await _userManager.IsInRoleAsync(user, Roles.Admin);
            var membersQuery = _context.Users
                .Where(u => u.IsActive)
                .AsQueryable();
            if (!isAdmin)
            {
                membersQuery = membersQuery.Where(u => u.DepartmentId == user.DepartmentId);
            }
            var members = await membersQuery
                .OrderBy(u => u.FirstName)
                .Select(u => new AssignableMemberResponse
                {
                    UserId = u.Id,
                    FullName = $"{u.FirstName} {u.LastName}",
                })
                .ToListAsync();
            return members;
        }

        public async Task<TaskItem> GetTask(Guid id, TeamMember currentUser)
        {
            var task = await _context.Tasks
                .Include(t => t.AssignedBy)
                .Include(t => t.AssignedTo)
                .FirstOrDefaultAsync(t => t.Id == id) ?? throw new KeyNotFoundException("Task does not exist");

            var isAdmin = await _userManager.IsInRoleAsync(currentUser, Roles.Admin);
            var isManager = await _userManager.IsInRoleAsync(currentUser, Roles.Manager);
            var isOwnTask = task.AssignedToId == currentUser.Id || task.AssignedById == currentUser.Id;

            if (!isAdmin && !isOwnTask)
            {
                if (!isManager || task.AssignedTo.DepartmentId != currentUser.DepartmentId)
                    throw new UnauthorizedAccessException("You do not have permission");
            }
            return task;
        }

        public async Task<List<TaskItem>> GetTasks(TaskQueryParameters query, TeamMember currentUser)
        {
            var isAdmin = await _userManager.IsInRoleAsync(currentUser, Roles.Admin);
            var isManager = await _userManager.IsInRoleAsync(currentUser, Roles.Manager);

            var tasksQuery = _context.Tasks
                .Include(t => t.AssignedBy)
                .Include(t => t.AssignedTo)
                .ApplyTaskFilters(query)
                .AsQueryable();

            if (!isAdmin && !isManager)
            {
                tasksQuery = tasksQuery.Where(t => t.AssignedToId == currentUser.Id);
            }
            else if (isManager && !isAdmin)
            {
                if (!string.IsNullOrEmpty(query.AssigneeId))
                {
                    var target = await _userManager.FindByIdAsync(query.AssigneeId);
                    if (target is null || target.DepartmentId != currentUser.DepartmentId)
                        throw new UnauthorizedAccessException("You do not have permission");

                    tasksQuery = tasksQuery.Where(t => t.AssignedToId == query.AssigneeId);
                }
                else
                {
                    tasksQuery = tasksQuery.Where(t => t.AssignedTo.DepartmentId == currentUser.DepartmentId);
                }
            }

            var tasks = await tasksQuery
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
            return tasks;
        }

        public async Task<TaskSummaryResponse> GetTaskSummary(TeamMember user)
        {
            if (await _userManager.IsInRoleAsync(user, Roles.Regular))
            {
                var tasks = await _context.Tasks.Where(t => t.AssignedToId == user.Id).ToListAsync();
                var numberOfTasks = tasks.Count();
                var inProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress);
                var inReviewTasks = tasks.Count(t => t.Status == TaskItemStatus.InReview);
                var completedTasks = tasks.Count(t => t.Status == TaskItemStatus.Completed);
                var overdueTasks = tasks.Count(t => t.Status == TaskItemStatus.Overdue);
                var taskSummaryResponse = new TaskSummaryResponse
                {
                    TotalTasks = numberOfTasks,
                    InProgressTasks = inProgressTasks,
                    InReviewTasks = inReviewTasks,
                    CompletedTasks = completedTasks,
                    OverdueTasks = overdueTasks
                };
                return taskSummaryResponse;
            }
            else if (await _userManager.IsInRoleAsync(user, Roles.Manager) || await _userManager.IsInRoleAsync(user, Roles.Admin))
            {
                var tasks = await _context.Tasks.Where(t => t.AssignedById == user.Id).ToListAsync();
                var numberOfTasks = tasks.Count();
                var inProgressTasks = tasks.Count(t => t.Status == TaskItemStatus.InProgress);
                var inReviewTasks = tasks.Count(t => t.Status == TaskItemStatus.InReview);
                var completedTasks = tasks.Count(t => t.Status == TaskItemStatus.Completed);
                var overdueTasks = tasks.Count(t => t.Status == TaskItemStatus.Overdue);
                var taskSummaryResponse = new TaskSummaryResponse
                {
                    TotalTasks = numberOfTasks,
                    InProgressTasks = inProgressTasks,
                    InReviewTasks = inReviewTasks,
                    CompletedTasks = completedTasks,
                    OverdueTasks = overdueTasks
                };
                return taskSummaryResponse;
            }
            else { throw new UnauthorizedAccessException("Invalid user"); }
        }

        public async Task<TaskItem> UpdateTask(Guid id, UpdateTaskDto dto, TeamMember currentUser)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                throw new ArgumentException("Title is required.");

            if (!ValidPriorities.Contains(dto.Priority))
                throw new InvalidOperationException($"'{dto.Priority}' is not a recognized priority.");

            var task = await _context.Tasks
                .Include(t => t.AssignedTo)
                .FirstOrDefaultAsync(t => t.Id == id) ?? throw new KeyNotFoundException("Task dos not exist");

            var isAdmin = await _userManager.IsInRoleAsync(currentUser, Roles.Admin);

            if (!isAdmin && task.AssignedTo.DepartmentId != currentUser.DepartmentId)
                throw new UnauthorizedAccessException("Unable to perform this action");

            if (dto.AssigneeId != task.AssignedToId)
            {
                var newAssignee = await _userManager.FindByIdAsync(dto.AssigneeId) ?? throw new KeyNotFoundException("Assignee not found");

                if (!isAdmin && newAssignee.DepartmentId != currentUser.DepartmentId)
                   throw new UnauthorizedAccessException("Unable to perform this action");

                task.AssignedToId = dto.AssigneeId;
            }

            task.Title = dto.Title.Trim();
            task.Description = dto.Description?.Trim();
            task.Priority = dto.Priority;
            task.DueDate = dto.DueDate;
            if(dto.Progress.HasValue)
            {
                if (dto.Progress < 0 || dto.Progress > 100)
                    throw new ArgumentException("Progress must be between 0 and 100");
                task.Progress = dto.Progress.Value;
            }
            await _context.SaveChangesAsync();

            var updated = await _context.Tasks
                .Include(t => t.AssignedBy)
                .Include(t => t.AssignedTo)
                .FirstAsync(t => t.Id == id);
            return updated;
        }

        public async Task UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusDto dto, TeamMember currentUser)
        {
            if (!ValidStatuses.Contains(dto.Status)) throw new Exception($"{dto.Status} is not a recognised task status");
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id) ?? throw new KeyNotFoundException("Task does not exist");
            var isAssignee = task.AssignedToId == currentUser.Id;
            var isManagerOrAdmin = await _userManager.IsInRoleAsync(currentUser, "admin")
                || await _userManager.IsInRoleAsync(currentUser, "manager");

            if (dto.Status == TaskItemStatus.Cancelled)
            {
                if (!isManagerOrAdmin) throw new UnauthorizedAccessException("You do not have permission");
                task.Status = TaskItemStatus.Cancelled;
                await _context.SaveChangesAsync();
            }

            var key = (task.Status, dto.Status);
            if (!AllowedTransitions.TryGetValue(key, out var allowedRole))
                throw new InvalidOperationException($"Cannot move from {task.Status} to {dto.Status}");

            var canTransition = (isAssignee && allowedRole.Contains("Assignee"))
                || (isManagerOrAdmin && allowedRole.Contains("Manager")) || (isManagerOrAdmin && allowedRole.Contains("Admin"));
            if (!canTransition) throw new UnauthorizedAccessException("You do not have permission");
            task.Status = dto.Status;
            if (dto.Status == TaskItemStatus.Completed) task.CompletedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
