using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Auth.DTOs.Requests
{
    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; }
    }
}
