
namespace CostControlSystem.Application.TechnicalServices.Security
{
    public class AccessTokenResult
    {
        public string AccessToken { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
    }
}
