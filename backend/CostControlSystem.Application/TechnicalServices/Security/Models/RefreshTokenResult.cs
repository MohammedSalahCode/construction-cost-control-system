namespace CostControlSystem.Application.TechnicalServices.Security.Models
{
    public class RefreshTokenResult
    {
        public string RefreshToken { get; set; } = string.Empty;

        public string RefreshTokenHash { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
    }
}
