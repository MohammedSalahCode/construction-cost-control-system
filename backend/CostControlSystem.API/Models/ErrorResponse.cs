using System.Text.Json.Serialization;

namespace CostControlSystem.API.Models
{
    public class ErrorResponse
    {
        public int Status { get; set; }

        public string Message { get; set; } = string.Empty;

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Dictionary<string, string[]>? Errors { get; set; }
    }
}
