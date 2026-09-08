namespace backend.Dtos
{
    public class RefreshResponseDto
    {
        public required string AccessToken { get; set; }
        public required string RefreshToken { get; set; }
    }
}
