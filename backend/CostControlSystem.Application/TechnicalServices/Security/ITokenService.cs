using CostControlSystem.Application.TechnicalServices.Security.Models;
using CostControlSystem.Domain.Entities;

namespace CostControlSystem.Application.TechnicalServices.Security
{

    public interface ITokenService
    {

        AccessTokenResult GenerateAccessToken(User user);

        RefreshTokenResult GenerateRefreshToken(bool rememberMe);

    }
}
