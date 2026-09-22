using backend.Dtos;
using backend.Models;

namespace backend.Services
{
    public static class QueryExtensions
    {
        public static IQueryable<TeamMember> ApplyMemberQueryFilters(this IQueryable<TeamMember> query, MemberQueryParameters? filters)
        {
            if (filters is null) return query;

            if(!string.IsNullOrWhiteSpace(filters.Search))
            {
                query = query.Where(u =>
                    u.FirstName.Contains(filters.Search) ||
                    u.LastName.Contains(filters.Search) ||
                    u.Email!.Contains(filters.Search)
                );
            }

            if (filters.DepartmentId.HasValue)
            {
                query = query.Where(u =>
                u.DepartmentId == filters.DepartmentId.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.JobTitle))
            {
                query = query.Where(u =>
                    u.JobTitle!.Contains(filters.JobTitle));
            }
            if (filters.IsActive.HasValue)
            {
                query = query.Where(u =>
                    u.IsActive == filters.IsActive);
            }

            return query;
        }

        public static IQueryable<TaskItem> ApplyTaskFilters(this IQueryable<TaskItem> query, TaskQueryParameters? filters)
        {
            if (filters is null) return query;

            if (!string.IsNullOrWhiteSpace(filters.Search))
            {
                query = query.Where(t =>
                    t.Title.Contains(filters.Search)
                );
            }

            if (!string.IsNullOrWhiteSpace(filters.Priority))
            {
                query = query.Where(t =>
                t.Priority == filters.Priority);
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(t =>
                    t.Status == filters.Status);
            }
            if (!string.IsNullOrWhiteSpace(filters.AssigneeId))
            {
                query = query.Where(t =>
                    t.AssignedToId == filters.AssigneeId);
            }

            return query;
        }

        public static IQueryable<TeamMember> OnlyActive(this IQueryable<TeamMember> query)
           => query.Where(u => u.IsActive);
    }
}
