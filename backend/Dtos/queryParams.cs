namespace backend.Dtos
{
    public class MemberQueryParameters
    {
        public string? Search { get; set; }
        public int? DepartmentId { get; set; }
        public string? JobTitle { get; set; }
        public bool? IsActive { get; set; }
    }
}
