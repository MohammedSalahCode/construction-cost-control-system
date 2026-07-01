using System;
using System.Collections.Generic;
using CostControlSystem.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace CostControlSystem.Application.TechnicalServices.Security
{
    public class TokenService : ITokenService
    {
        private readonly JwtSettings _jwtSettings;

        public TokenService(IOptions<JwtSettings> jwtSettings)
        {
            _jwtSettings = jwtSettings.Value;
        }

        public AccessTokenResult GenerateAccessToken(User user)
        {

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.Name)
            };


            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));

            var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: signingCredentials
            );

            return new AccessTokenResult
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
                ExpiresAt = expiresAt
            };
        }

        public string GenerateRefreshToken()
        {
            byte[] randomBytes = new byte[32];

            RandomNumberGenerator.Fill(randomBytes);

            return Convert.ToBase64String(randomBytes);
        }

        public string HashRefreshToken(string refreshToken)
        {
            byte[] tokenBytes = Encoding.UTF8.GetBytes(refreshToken);

            byte[] hashBytes = SHA256.HashData(tokenBytes);

            return Convert.ToHexString(hashBytes);
        }
    }
}
