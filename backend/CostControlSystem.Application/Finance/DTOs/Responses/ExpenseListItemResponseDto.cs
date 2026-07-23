namespace CostControlSystem.Application.Finance.DTOs.Responses
{
    public class ExpenseListItemResponseDto
    {
        public int Id { get; set; }

        public string ExpenseType { get; set; } = string.Empty;

        public string? ItemNumber { get; set; }

        public string? ItemName { get; set; }

        public decimal Amount { get; set; }

        public DateOnly ExpenseDate { get; set; }

        public string Status { get; set; } = string.Empty;

        public string SubmittedBy { get; set; } = string.Empty;

        public string? ReferenceNumber { get; set; }

        public string? Description { get; set; }

        public string? ReviewerComment { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
