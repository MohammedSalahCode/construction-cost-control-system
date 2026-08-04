namespace CostControlSystem.Application.CostAnalysis.Helpers
{
    public class CostAnalysisCalculator
    {
        public static CostAnalysisCalculationResult Calculate(
            decimal estimatedUnitCost,
            decimal contractQuantity,
            decimal cumulativeExecutedQuantity,
            decimal periodExecutedQuantity,
            decimal unitPrice,
            decimal actualCost)
        {
            decimal budgetUnitCost = estimatedUnitCost;

            decimal budget = budgetUnitCost * contractQuantity;

            decimal periodPlannedCost = budgetUnitCost * periodExecutedQuantity;

            decimal contractValue = contractQuantity * unitPrice;

            decimal cumulativeProgressPercentage =
                contractQuantity == 0
                    ? 0
                    : (cumulativeExecutedQuantity / contractQuantity) * 100;

            decimal periodProgressPercentage =
                contractQuantity == 0
                    ? 0
                    : (periodExecutedQuantity / contractQuantity) * 100;

            decimal earnedRevenue = periodExecutedQuantity * unitPrice;

            decimal profit = earnedRevenue - actualCost;

            decimal? profitMarginPercentage =
                earnedRevenue == 0
                    ? null
                    : (profit / earnedRevenue) * 100;

            return new CostAnalysisCalculationResult
            {
                Budget = budget,
                PeriodPlannedCost = periodPlannedCost,
                ContractValue = contractValue,
                CumulativeProgressPercentage = cumulativeProgressPercentage,
                PeriodProgressPercentage = periodProgressPercentage,
                EarnedRevenue = earnedRevenue,
                Profit = profit,
                ProfitMarginPercentage = profitMarginPercentage,
            };
        }
    }
}
