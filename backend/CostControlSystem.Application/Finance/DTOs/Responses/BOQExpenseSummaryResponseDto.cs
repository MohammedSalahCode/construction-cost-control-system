namespace CostControlSystem.Application.Finance.DTOs.Responses
{
    public class BOQExpenseSummaryResponseDto
    {
        public int BOQItemId { get; set; }

        public string ItemNumber { get; set; } = string.Empty;

        public string ItemName { get; set; } = string.Empty;

        public string Unit { get; set; } = string.Empty;

        public decimal ContractQuantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal ContractValue { get; set; }

        public decimal TotalApprovedExpenses { get; set; }
    }
}
