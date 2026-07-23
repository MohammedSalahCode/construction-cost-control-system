namespace CostControlSystem.Application.Progress.DTOs.Responses
{
    public class BOQProgressSummaryResponseDto
    {
        public int BOQItemId { get; set; }

        public string ItemNumber { get; set; } = string.Empty;

        public string ItemName { get; set; } = string.Empty;

        public string Unit { get; set; } = string.Empty;

        public decimal ContractQuantity { get; set; }

        public decimal ExecutedQuantity { get; set; }

        public decimal RemainingQuantity { get; set; }

        public decimal ProgressPercentage { get; set; }
    }
}
