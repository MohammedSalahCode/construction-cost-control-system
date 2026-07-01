using System;
using System.Collections.Generic;
using CostControlSystem.Domain.Entities;

namespace CostControlSystem.Application.TechnicalServices.Security
{

    public interface ITokenService
    {

        AccessTokenResult GenerateAccessToken(User user);

        string GenerateRefreshToken();

        string HashRefreshToken(string refreshToken);

    }
}
