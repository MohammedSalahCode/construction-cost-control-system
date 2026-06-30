using System;
using System.Collections.Generic;

namespace CostControlSystem.Application.Auth.DTOs.Responses
{
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public string RefreshToken { get; set; } = string.Empty;
    }
}
