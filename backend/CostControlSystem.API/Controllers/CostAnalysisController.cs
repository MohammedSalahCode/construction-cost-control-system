using CostControlSystem.Application.CostAnalysis.DTOs.Responses;
using CostControlSystem.Application.CostAnalysis.Enums;
using CostControlSystem.Application.CostAnalysis.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [Route("api")]
    [Authorize]
    [ApiController]
    public class CostAnalysisController : ControllerBase
    {

        private readonly ICostAnalysisService _costAnalysisService;

        public CostAnalysisController(ICostAnalysisService costAnalysisService)
        {
            _costAnalysisService = costAnalysisService;
        }

        [HttpGet("projects/{projectId:int}/cost-analysis/items")]
        public async Task<ActionResult<ItemAnalysisResultDto>> GetItemAnalysis(
            int projectId,
            [FromQuery] CostAnalysisPeriod period = CostAnalysisPeriod.Cumulative,
            [FromQuery] DateOnly? startDate = null,
            [FromQuery] DateOnly? endDate = null)
        {
            var result = await _costAnalysisService.GetItemAnalysisAsync(projectId, period, startDate, endDate);

            return Ok(result);
        }
    }
}
