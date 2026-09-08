namespace backend.Dtos
{
    public class UpdateEventDto
    {
        public Guid EventId { get; set; }
        public string? EventDescription { get; set; }
        public ICollection<string>? UserIds { get; set; }
        public string? Start {  get; set; }
        public string? End { get; set; }
    }
}
