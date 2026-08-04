namespace CostControlSystem.Application.CostAnalysis.Helpers
{
    public class CostAnalysisCalculationResult
    {
        public decimal Budget { get; set; }

        public decimal PeriodPlannedCost  { get; set; }

        public decimal ContractValue { get; set; }

        public decimal CumulativeProgressPercentage { get; set; }

        public decimal PeriodProgressPercentage { get; set; }

        public decimal EarnedRevenue { get; set; }

        public decimal Profit { get; set; }

        public decimal? ProfitMarginPercentage { get; set; }
    }
}
