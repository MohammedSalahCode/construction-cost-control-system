using CostControlSystem.API.Models;

namespace CostControlSystem.API.Factories
{
    public class ErrorResponseFactory
    {
        public static ErrorResponse Create(
            int status,
            string message,
            Dictionary<string, string[]>? errors = null)
        {
            return new ErrorResponse
            {
                Status = status,
                Message = message,
                Errors = errors
            };
        }
    }
}
