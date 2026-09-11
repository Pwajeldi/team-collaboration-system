namespace backend.Dtos
{
    public class UpdateEventDto
    {
        public Guid EventId { get; set; }
        public string? EventDescription { get; set; }
        public ICollection<string>? UserIds { get; set; }
        public string? Start {  get; set; }
        public string? End { get; set; }
        public string? Location { get; set; }
        public string? Title { get; set; }
        public bool isMeeting { get; set; }
    }

    public class UpdateEventDurationDto
    {
        public Guid EventId { get; set; }
        public DateTime NewStartTime { get; set; }
        public DateTime NewEndTime { get; set; }
    }
}
