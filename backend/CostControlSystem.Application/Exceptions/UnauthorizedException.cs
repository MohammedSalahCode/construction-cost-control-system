namespace CostControlSystem.Application.Exceptions
{
    public class UnauthorizedException : Exception
    {
        public UnauthorizedException()
            : base("Invalid credentials.")
        {
        }

        public UnauthorizedException(string message)
            : base(message)
        {
        }
    }
}
