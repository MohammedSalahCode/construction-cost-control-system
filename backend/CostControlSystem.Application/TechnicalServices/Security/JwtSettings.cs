using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.TechnicalServices.Security
{
    public class JwtSettings
    {
        [Required]
        public string SecretKey { get; set; } = null!;

        [Required]
        public string Issuer { get; set; } = null!;

        [Required]
        public string Audience { get; set; } = null!;

        [Range(1, int.MaxValue)]
        public int AccessTokenExpirationMinutes { get; set; }

        [Range(1, 365)]
        public int RefreshTokenExpirationDays { get; set; }

        [Range(1, 365)]
        public int RememberMeRefreshTokenExpirationDays { get; set; }
    }
}
