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

            if (!user.IsActive)
            {
                throw new UnauthorizedException("User account is inactive.");
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

        public async Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var refreshTokenHash =
                _tokenService.HashRefreshToken(request.RefreshToken);

            var refreshToken = await _context.RefreshTokens
                .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
                .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash);

            if (refreshToken == null)
            {
                throw new UnauthorizedException("Invalid refresh token.");
            }

            if (refreshToken.IsRevoked)
            {
                throw new UnauthorizedException("Invalid refresh token.");
            }

            if (refreshToken.ExpiresAt <= DateTime.UtcNow)
            {
                throw new UnauthorizedException("Invalid refresh token.");
            }

            if (!refreshToken.User.IsActive)
            {
                throw new UnauthorizedException("Invalid refresh token.");
            }

            var accessTokenResult =
                _tokenService.GenerateAccessToken(refreshToken.User);

            var newRefreshToken =
                _tokenService.GenerateRefreshToken();

            var newRefreshTokenHash =
                _tokenService.HashRefreshToken(newRefreshToken);

            var newRefreshTokenExpiration =
                _tokenService.GetRefreshTokenExpiration(false);

            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;


            var newRefreshTokenEntity = new RefreshToken
            {
                UserId = refreshToken.UserId,
                TokenHash = newRefreshTokenHash,
                ExpiresAt = newRefreshTokenExpiration,
                IsRevoked = false
            };

            _context.RefreshTokens.Add(newRefreshTokenEntity);
            await _context.SaveChangesAsync();

            return new RefreshTokenResponseDto
            {
                AccessToken = accessTokenResult.AccessToken,
                RefreshToken = newRefreshToken
            };
        }

        public async Task LogoutAsync(LogoutRequestDto request)
        {
            var refreshTokenHash =
                _tokenService.HashRefreshToken(request.RefreshToken);

            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == refreshTokenHash);

            if (refreshToken == null)
            {
                return;
            }

            if (refreshToken.IsRevoked)
            {
                return;
            }

            refreshToken.IsRevoked = true;
            refreshToken.RevokedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task<CurrentUserResponseDto> GetCurrentUserAsync(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                throw new NotFoundException("User not found.");
            }

            if (!user.IsActive)
            {
                throw new UnauthorizedException("User account is inactive.");
            }

            return new CurrentUserResponseDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.Name,
            };
        }
    }
}
