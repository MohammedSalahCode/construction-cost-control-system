using CostControlSystem.Application.Auth.DTOs.Requests;
using CostControlSystem.Application.Auth.DTOs.Responses;
using CostControlSystem.Application.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            if (!int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized();
            }

            var response = await _authService.GetCurrentUserAsync(userId);

            return Ok(response);
        }
    }
}
