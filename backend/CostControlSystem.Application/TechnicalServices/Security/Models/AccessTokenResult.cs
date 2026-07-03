namespace CostControlSystem.Application.TechnicalServices.Security.Models
{
    public class AccessTokenResult
    {
        public string AccessToken { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
    }
}
