namespace CostControlSystem.Application.Progress.DTOs.Responses
{
    public class ProgressListItemResponseDto
    {
        public int Id { get; set; }

        public string ItemNumber { get; set; } = string.Empty;

        public string ItemName { get; set; } = string.Empty;

        public decimal QuantityDone { get; set; }

        public DateOnly ExecutionDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public string SubmittedBy { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public string? ReviewerComment { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
