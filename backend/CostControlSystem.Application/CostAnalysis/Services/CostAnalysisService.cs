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
    }
}
