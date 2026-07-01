using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
    }
}
