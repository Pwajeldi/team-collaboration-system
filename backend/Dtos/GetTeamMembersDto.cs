using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos
{
    public class GetMembersDto
    {
        public int Page { get; set; } = 1;
        public int? PageSize { get; set; } = 10;
        public string? Dept { get; set; }
        public string? FirstName { get; set; }
        public string? JobTitle { get; set; }
    }

    public class PaginatedResponse<T>
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Total { get; set; }
        public int TotalPages { get; set; }
        public int? NextPage { get; set; }  // current page + 1
        public int? PreviousPage { get; set; }  // previous page - 1
        public bool HasNextPage { get; set; } // false if item count < perPage
        public bool HasPreviousPage { get; set; } // true if page > 1
        public List<T> Items { get; set; } = [];  
    }

    public class CreateMemberDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? JobTitle { get; set; }
        [Required] public int Department { get; set; }
        public string? Role { get; set; }
    }

    public class GetMemberResponse
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string MemberId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime DateJoined { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string ProfilePictureUrl { get; set; } = string.Empty;
    }

    public class LoginDto
    {
        public required string Email { get; set; } = string.Empty;
        public required string Password { get; set; } = string.Empty;
    }

    public class UpdateMemberDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? JobTitle { get; set; }
        public string? Role { get; set; }
        public int? DepartmentId { get; set; }
    }

    public class GetMemberListDto
    {
        public string? UserId { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public int UnreadMessages { get; set; }
        public string? ProfilePictureUrl {get; set; }
    }
}
