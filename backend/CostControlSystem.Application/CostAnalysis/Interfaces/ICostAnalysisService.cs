using CostControlSystem.Application.CostAnalysis.DTOs.Responses;
using CostControlSystem.Application.CostAnalysis.Enums;

namespace CostControlSystem.Application.CostAnalysis.Interfaces
{
    public interface ICostAnalysisService
    {
        Task<ItemAnalysisResultDto> GetItemAnalysisAsync(
            int projectId,
            CostAnalysisPeriod period,
            DateOnly? startDate = null,
            DateOnly? endDate = null);


        Task<CostAnalysisOverviewDto> GetOverviewAsync(
            int projectId,
            CostAnalysisPeriod period,
            DateOnly? startDate = null,
            DateOnly? endDate = null);
    }
}
