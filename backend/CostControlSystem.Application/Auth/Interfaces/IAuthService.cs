using CostControlSystem.Application.Auth.DTOs.Requests;
using CostControlSystem.Application.Auth.DTOs.Responses;

namespace CostControlSystem.Application.Auth.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);

        Task<RefreshTokenResponseDto> RefreshTokenAsync(RefreshTokenRequestDto request);

        Task LogoutAsync(LogoutRequestDto request);

        Task<CurrentUserResponseDto> GetCurrentUserAsync();
    }
}