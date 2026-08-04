using CostControlSystem.Application.CostAnalysis.Enums;

namespace CostControlSystem.Application.CostAnalysis.DTOs.Responses
{
    public class ItemAnalysisResultDto
    {
        public CostAnalysisPeriod Period { get; set; }

        public DateOnly StartDate { get; set; }

        public DateOnly EndDate { get; set; }

        public IReadOnlyList<ItemAnalysisItemDto> Items { get; set; } = [];
    }
}
