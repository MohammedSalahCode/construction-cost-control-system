using CostControlSystem.Application.Auth.DTOs.Requests;
using CostControlSystem.Application.Auth.DTOs.Responses;
using CostControlSystem.Application.Auth.Interfaces;
using CostControlSystem.Application.Exceptions;
using CostControlSystem.Application.TechnicalServices.Security;
using CostControlSystem.Domain.Entities;
using CostControlSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly CostControlSystemDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly PasswordHasherService _passwordHasher;

        public AuthService(
            CostControlSystemDbContext context,
            ITokenService tokenService,
            PasswordHasherService passwordHasher)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = passwordHasher;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == request.Email);


            if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedException("Invalid credentials.");
            }


            var accessTokenResult = _tokenService.GenerateAccessToken(user);

            var refreshToken = _tokenService.GenerateRefreshToken();

            var refreshTokenHash = _tokenService.HashRefreshToken(refreshToken);

            var refreshTokenExpiration =
                _tokenService.GetRefreshTokenExpiration(request.RememberMe);


            var refreshTokenEntity = new RefreshToken
            {
                UserId = user.Id,
                TokenHash = refreshTokenHash,
                ExpiresAt = refreshTokenExpiration,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync();

            return new LoginResponseDto
            {
                AccessToken = accessTokenResult.AccessToken,
                RefreshToken = refreshToken,
                ExpiresAt = accessTokenResult.ExpiresAt
            };
        }

        public Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task LogoutAsync(LogoutRequestDto request)
        {
            throw new NotImplementedException();
        }

        public Task<CurrentUserResponseDto> GetCurrentUserAsync()
        {
            throw new NotImplementedException();
        }
    }
}
