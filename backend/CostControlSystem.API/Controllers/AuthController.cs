using CostControlSystem.Application.Auth.DTOs.Requests;
using CostControlSystem.Application.Auth.DTOs.Responses;
using CostControlSystem.Application.Auth.Interfaces;
using CostControlSystem.API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }


        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login(
            [FromBody] LoginRequestDto request)
        {
            var response = await _authService.LoginAsync(request);

            return Ok(response);
        }



        [HttpPost("refresh")]
        [AllowAnonymous]
        public async Task<ActionResult<RefreshTokenResponseDto>> Refresh(
            [FromBody] RefreshTokenRequestDto request)
        {
            var response = await _authService.RefreshTokenAsync(request);

            return Ok(response);
        }



        [HttpPost("logout")]
        [AllowAnonymous]
        public async Task<IActionResult> Logout(
            [FromBody] LogoutRequestDto request)
        {
            await _authService.LogoutAsync(request);

            return NoContent();
        }



        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<CurrentUserResponseDto>> Me()
        {
            int currentUserId = User.GetCurrentUserId();

            var response = await _authService.GetCurrentUserAsync(currentUserId);

            return Ok(response);
        }
    }
}
