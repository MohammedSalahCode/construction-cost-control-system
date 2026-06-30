using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Auth.DTOs.Requests
{
    public class RefreshTokenRequestDto
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }
}
