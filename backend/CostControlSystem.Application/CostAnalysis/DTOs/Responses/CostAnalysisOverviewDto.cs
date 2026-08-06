using CostControlSystem.Application.CostAnalysis.Enums;

namespace CostControlSystem.Application.CostAnalysis.DTOs.Responses
{
    public class CostAnalysisOverviewDto
    {
        public CostAnalysisPeriod Period { get; set; }

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public decimal ContractValue { get; set; }

        public decimal EarnedRevenue { get; set; }

        public decimal ActualCost { get; set; }

        public decimal NetProfit { get; set; }

        public decimal? NetProfitMarginPercentage { get; set; }

        public decimal GrossProfit { get; set; }

        public decimal? GrossProfitMarginPercentage { get; set; }

        public decimal OverallProgressPercentage { get; set; }

        public int CompletedItems { get; set; }

        public int InProgressItems { get; set; }

        public int NotStartedItems { get; set; }

        public decimal Budget { get; set; }

        public decimal PeriodPlannedCost { get; set; }

        public decimal CostVariance { get; set; }

        public decimal? CPI { get; set; }

        public decimal DirectCost { get; set; }

        public decimal IndirectCost { get; set; }

        public decimal Overhead { get; set; }

        public CostControlAlertsDto Alerts { get; set; } = new();
    }
}
