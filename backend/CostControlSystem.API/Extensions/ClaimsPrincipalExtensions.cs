using CostControlSystem.Application.Exceptions;
using System.Security.Claims;

namespace CostControlSystem.API.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetCurrentUserId(this ClaimsPrincipal user)
        {
            var claim = user.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                throw new UnauthorizedException("User ID claim was not found.");
            }

            return int.Parse(claim.Value);
        }
    }
}
