namespace CostControlSystem.Application.CostAnalysis.DTOs.Responses
{
    public class ItemAnalysisItemDto
    {
        public int BOQItemId { get; set; }

        public string ItemNumber { get; set; } = string.Empty;

        public string ItemName { get; set; } = string.Empty;

        public decimal ContractQuantity { get; set; }

        public decimal ContractValue { get; set; }

        public decimal Budget { get; set; }

        public decimal PeriodPlannedCost { get; set; }

        public decimal PeriodExecutedQuantity { get; set; }

        public decimal CumulativeExecutedQuantity { get; set; }

        public decimal PeriodProgressPercentage { get; set; }

        public decimal CumulativeProgressPercentage { get; set; }

        public decimal EarnedRevenue { get; set; }

        public decimal ActualCost { get; set; }

        public decimal Profit { get; set; }

        public decimal? ProfitMarginPercentage { get; set; }

        public decimal? EstimatedUnitCost { get; set; }
    }
}
