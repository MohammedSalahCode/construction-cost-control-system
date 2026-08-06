using CostControlSystem.Application.CostAnalysis.DTOs.Responses;
using CostControlSystem.Application.CostAnalysis.Enums;
using CostControlSystem.Application.CostAnalysis.Helpers;
using CostControlSystem.Application.CostAnalysis.Interfaces;
using CostControlSystem.Application.Exceptions;
using CostControlSystem.Infrastructure.Data;
using CostControlSystem.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.CostAnalysis.Services
{
    public class CostAnalysisService: ICostAnalysisService
    {
        private readonly CostControlSystemDbContext _context;

        public CostAnalysisService(CostControlSystemDbContext context)
        {
            _context = context;
        }

        public async Task<ItemAnalysisResultDto> GetItemAnalysisAsync(
            int projectId,
            CostAnalysisPeriod period,
            DateOnly? startDate = null,
            DateOnly? endDate = null)
        {
            var project = await _context.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            var periodRange = CostAnalysisPeriodHelper.GetPeriod(
                period,
                project.StartDate,
                startDate,
                endDate);

            var items = await _context.BOQItems
                .AsNoTracking()
                .Where(b => b.ProjectId == projectId)
                .Select(b => new
                {
                    b.Id,
                    b.ItemNumber,
                    b.ItemName,
                    ContractQuantity = b.Quantity,
                    b.UnitPrice,
                    EstimatedUnitCost = b.EstimatedCost != null
                        ? (decimal?)b.EstimatedCost.EstimatedUnitCost
                        : null,

                    CumulativeExecutedQuantity =
                        b.ProgressEntries
                            .Where(p => p.Status == ApprovalStatus.Approved
                                && p.ExecutionDate <= periodRange.EndDate)
                            .Sum(p => (decimal?)p.QuantityDone) ?? 0,

                    PeriodExecutedQuantity =
                        b.ProgressEntries
                            .Where(p => p.Status == ApprovalStatus.Approved
                                && p.ExecutionDate >= periodRange.StartDate
                                && p.ExecutionDate <= periodRange.EndDate)
                            .Sum(p => (decimal?)p.QuantityDone) ?? 0,

                    ActualCost =
                        b.Expenses
                            .Where(e => e.Status == ApprovalStatus.Approved
                                && e.ExpenseDate >= periodRange.StartDate
                                && e.ExpenseDate <= periodRange.EndDate)
                            .Sum(e => (decimal?)e.Amount) ?? 0
                })
                .OrderBy(b => b.ItemNumber)
                .ToListAsync();

            var itemAnalysis = items
                .Select(item =>
                {
                    var result = CostAnalysisCalculator.Calculate(
                        item.EstimatedUnitCost ?? 0,
                        item.ContractQuantity,
                        item.CumulativeExecutedQuantity,
                        item.PeriodExecutedQuantity,
                        item.UnitPrice,
                        item.ActualCost);

                    return new ItemAnalysisItemDto
                    {
                        BOQItemId = item.Id,
                        ItemNumber = item.ItemNumber,
                        ItemName = item.ItemName,

                        ContractQuantity = item.ContractQuantity,
                        ContractValue = result.ContractValue,

                        Budget = result.Budget,
                        PeriodPlannedCost = result.PeriodPlannedCost,

                        PeriodExecutedQuantity = item.PeriodExecutedQuantity,
                        CumulativeExecutedQuantity = item.CumulativeExecutedQuantity,

                        PeriodProgressPercentage = result.PeriodProgressPercentage,
                        CumulativeProgressPercentage = result.CumulativeProgressPercentage,

                        EarnedRevenue = result.EarnedRevenue,
                        ActualCost = item.ActualCost,
                        Profit = result.Profit,
                        ProfitMarginPercentage = result.ProfitMarginPercentage,

                        EstimatedUnitCost = item.EstimatedUnitCost,
                    };
                })
                .ToList();

            return new ItemAnalysisResultDto
            {
                Period = period,
                StartDate = periodRange.StartDate,
                EndDate = periodRange.EndDate,
                Items = itemAnalysis
            };
        }


        public async Task<CostAnalysisOverviewDto> GetOverviewAsync(
            int projectId,
            CostAnalysisPeriod period,
            DateOnly? startDate = null,
            DateOnly? endDate = null)
        {
            var project = await _context.Projects
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            var periodRange = CostAnalysisPeriodHelper.GetPeriod(
                period,
                project.StartDate,
                startDate,
                endDate);

            var today = DateOnly.FromDateTime(DateTime.Today);

            var items = await _context.BOQItems
                .AsNoTracking()
                .Where(b => b.ProjectId == projectId)
                .Select(b => new
                {
                    b.Id,
                    ContractQuantity = b.Quantity,
                    UnitPrice = b.UnitPrice,

                    EstimatedUnitCost = b.EstimatedCost != null
                        ? (decimal?)b.EstimatedCost.EstimatedUnitCost
                        : null,

                    // Current project status — independent of selected period
                    CumulativeExecutedQuantity =
                        b.ProgressEntries
                            .Where(p =>
                                p.Status == ApprovalStatus.Approved &&
                                p.ExecutionDate <= today)
                            .Sum(p => (decimal?)p.QuantityDone) ?? 0,

                    // Performance of selected period
                    PeriodExecutedQuantity =
                        b.ProgressEntries
                            .Where(p =>
                                p.Status == ApprovalStatus.Approved &&
                                p.ExecutionDate >= periodRange.StartDate &&
                                p.ExecutionDate <= periodRange.EndDate)
                            .Sum(p => (decimal?)p.QuantityDone) ?? 0
                })
                .ToListAsync();


            var expenses = await _context.Expenses
                .AsNoTracking()
                .Where(e =>
                    e.ProjectId == projectId &&
                    e.Status == ApprovalStatus.Approved &&
                    e.ExpenseDate >= periodRange.StartDate &&
                    e.ExpenseDate <= periodRange.EndDate)
                .Select(e => new
                {
                    e.BOQItemId,
                    e.Amount,
                    e.ExpenseType
                })
                .ToListAsync();


            var contractValue = items.Sum(x => x.ContractQuantity * x.UnitPrice);

            var earnedRevenue = items.Sum(x => x.PeriodExecutedQuantity * x.UnitPrice);

            var directCost = expenses
                .Where(e => e.ExpenseType == ExpenseTypes.Direct)
                .Sum(e => e.Amount);

            var indirectCost = expenses
                .Where(e => e.ExpenseType == ExpenseTypes.Indirect)
                .Sum(e => e.Amount);

            var overhead = expenses
                .Where(e => e.ExpenseType == ExpenseTypes.Overhead)
                .Sum(e => e.Amount);

            var actualCost = directCost + indirectCost + overhead;

            var netProfit = earnedRevenue - actualCost;

            decimal? netProfitMarginPercentage =
                earnedRevenue == 0
                    ? null
                    : (netProfit / earnedRevenue) * 100;

            var grossProfit = earnedRevenue - directCost;

            decimal? grossProfitMarginPercentage =
                earnedRevenue == 0
                    ? null
                    : (grossProfit / earnedRevenue) * 100;


            var totalContractQuantity = items.Sum(x => x.ContractQuantity);

            var totalCumulativeExecutedQuantity = items.Sum(x => x.CumulativeExecutedQuantity);

            var overallProgressPercentage =
                totalContractQuantity == 0
                    ? 0
                    : (totalCumulativeExecutedQuantity /
                       totalContractQuantity) * 100;

            var completedItems = items.Count(x =>
                x.ContractQuantity > 0 &&
                x.CumulativeExecutedQuantity >= x.ContractQuantity);

            var inProgressItems = items.Count(x =>
                x.CumulativeExecutedQuantity > 0 &&
                x.CumulativeExecutedQuantity < x.ContractQuantity);

            var notStartedItems = items.Count(x => x.CumulativeExecutedQuantity <= 0);


            var budget = items
                .Where(x => x.EstimatedUnitCost.HasValue)
                .Sum(x =>
                    x.EstimatedUnitCost!.Value *
                    x.ContractQuantity);

            var periodPlannedCost = items
                .Where(x => x.EstimatedUnitCost.HasValue)
                .Sum(x =>
                    x.EstimatedUnitCost!.Value *
                    x.PeriodExecutedQuantity);

            var costVariance = periodPlannedCost - actualCost;

            decimal? cpi = actualCost == 0 ? null : periodPlannedCost / actualCost;


            var costOverruns = items.Count(x =>
                x.EstimatedUnitCost.HasValue &&
                x.PeriodExecutedQuantity > 0 &&
                expenses
                    .Where(e =>
                        e.BOQItemId == x.Id &&
                        e.ExpenseType == ExpenseTypes.Direct)
                    .Sum(e => e.Amount)
                >
                x.EstimatedUnitCost!.Value *
                x.PeriodExecutedQuantity);

            var progressWithoutCost = items.Count(x =>
                x.PeriodExecutedQuantity > 0 &&
                expenses
                    .Where(e => e.BOQItemId == x.Id && e.ExpenseType == ExpenseTypes.Direct)
                    .Sum(e => e.Amount) == 0);

            var missingEstimatedCost = items.Count(x => !x.EstimatedUnitCost.HasValue);

            var LossRisk = items.Count(x =>
            {
                var itemRevenue = x.PeriodExecutedQuantity * x.UnitPrice;

                var itemDirectCost =
                    expenses
                        .Where(e => e.BOQItemId == x.Id && e.ExpenseType == ExpenseTypes.Direct)
                        .Sum(e => e.Amount);

                return itemRevenue > 0 && itemRevenue - itemDirectCost < 0;
            });

            return new CostAnalysisOverviewDto
            {
                Period = period,
                StartDate = periodRange.StartDate,
                EndDate = periodRange.EndDate,
                ContractValue = contractValue,
                EarnedRevenue = earnedRevenue,
                ActualCost = actualCost,
                NetProfit = netProfit,
                NetProfitMarginPercentage = netProfitMarginPercentage,
                GrossProfit = grossProfit,
                GrossProfitMarginPercentage = grossProfitMarginPercentage,
                OverallProgressPercentage = overallProgressPercentage,
                CompletedItems = completedItems,
                InProgressItems = inProgressItems,
                NotStartedItems = notStartedItems,
                Budget = budget,
                PeriodPlannedCost = periodPlannedCost,
                CostVariance = costVariance,
                CPI = cpi,
                DirectCost = directCost,
                IndirectCost = indirectCost,
                Overhead = overhead,
                Alerts = new CostControlAlertsDto
                {
                    CostOverruns = costOverruns,
                    ProgressWithoutCost = progressWithoutCost,
                    MissingEstimatedCost = missingEstimatedCost,
                    LossRisk = LossRisk
                }
            };
        }
    }
}
