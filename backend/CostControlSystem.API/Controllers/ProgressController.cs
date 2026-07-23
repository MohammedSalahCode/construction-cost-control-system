using CostControlSystem.API.Extensions;
using CostControlSystem.Application.Progress.DTOs.Requests;
using CostControlSystem.Application.Progress.DTOs.Responses;
using CostControlSystem.Application.Progress.Interfaces;
using CostControlSystem.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize]
    public class ProgressController : ControllerBase
    {
        private readonly IProgressService _progressService;

        public ProgressController(IProgressService progressService)
        {
            _progressService = progressService;
        }


        [HttpGet("projects/{projectId:int}/progress/summary")]
        public async Task<ActionResult<List<BOQProgressSummaryResponseDto>>> GetBOQSummary(int projectId)
        {
            var summary = await _progressService.GetBOQSummaryAsync(projectId);

            return Ok(summary);
        }


        [HttpGet("projects/{projectId:int}/progress")]
        public async Task<ActionResult<List<ProgressListItemResponseDto>>> GetAll(int projectId)
        {
            var progressList = await _progressService.GetAllAsync(projectId);

            return Ok(progressList);
        }


        [HttpGet("progress/{id:int}")]
        public async Task<ActionResult<ProgressListItemResponseDto>> GetById(int id)
        {
            var progress = await _progressService.GetByIdAsync(id);

            return Ok(progress);
        }


        [Authorize(Roles = RoleNames.SiteEngineer)]
        [HttpPost("boq-items/{boqItemId:int}/progress")]
        public async Task<ActionResult<ProgressListItemResponseDto>> Create(int boqItemId, [FromBody] CreateProgressRequestDto dto)
        {
            var currentUserId = User.GetCurrentUserId();

            var progress = await _progressService.CreateAsync(boqItemId, dto, currentUserId);

            return CreatedAtAction(nameof(GetById), new {id = progress.Id}, progress);
        }


        [Authorize(Roles = RoleNames.SiteEngineer)]
        [HttpPut("progress/{id:int}")]
        public async Task<ActionResult<ProgressListItemResponseDto>> Update(int id, [FromBody] UpdateProgressRequestDto dto)
        {
            var progress = await _progressService.UpdateAsync(id, dto);

            return Ok(progress);
        }

        [Authorize(Roles = RoleNames.ProjectManager)]
        [HttpPost("progress/{id:int}/approve")]

        public async Task<IActionResult> Approve(int id)
        {
            var currentUserId = User.GetCurrentUserId();

            await _progressService.ApproveAsync(id, currentUserId);

            return NoContent();
        }


        [Authorize(Roles = RoleNames.ProjectManager)]
        [HttpPost("progress/{id:int}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectProgressRequestDto dto)
        {
            var currentUserId = User.GetCurrentUserId();

            await _progressService.RejectAsync(id, dto, currentUserId);

            return NoContent();
        }
    }
}
