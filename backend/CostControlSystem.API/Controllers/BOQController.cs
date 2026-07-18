using CostControlSystem.Application.BOQ.DTOs.Requests;
using CostControlSystem.Application.BOQ.DTOs.Responses;
using CostControlSystem.Application.BOQ.Interfaces;
using CostControlSystem.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [ApiController]
    [Authorize]
    public class BOQController : ControllerBase
    {
        private readonly IBOQService _boqService;

        public BOQController(IBOQService boqService)
        {
            _boqService = boqService;
        }


        [HttpGet("api/projects/{projectId:int}/boq")]
        public async Task<ActionResult<List<BOQItemResponseDto>>> GetProjectItems(int projectId)
        {
            var boqItems = await _boqService.GetProjectItemsAsync(projectId);

            return Ok(boqItems);
        }


        [HttpGet("api/boq/{id:int}")]
        public async Task<ActionResult<BOQItemResponseDto>> GetById(int id)
        {
            var boqItem = await _boqService.GetByIdAsync(id);

            return Ok(boqItem);
        }


        [HttpPost("api/projects/{projectId:int}/boq")]
        [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.ProjectManager}")]
        public async Task<ActionResult<BOQItemResponseDto>> Create(int projectId, [FromBody] CreateBOQItemRequestDto dto)
        {
            var boqItem = await _boqService.CreateAsync(projectId, dto);

            return CreatedAtAction(nameof(GetById), new { id = boqItem.Id }, boqItem);
        }


        [HttpPut("api/boq/{id:int}")]
        [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.ProjectManager}")]
        public async Task<ActionResult<BOQItemResponseDto>> Update(int id, [FromBody] UpdateBOQItemRequestDto dto)
        {
            var boqItem = await _boqService.UpdateAsync(id, dto);

            return Ok(boqItem);
        }


        [HttpDelete("api/boq/{id:int}")]
        [Authorize(Roles = $"{RoleNames.Admin},{RoleNames.ProjectManager}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _boqService.DeleteAsync(id);

            return NoContent();
        }


        [HttpPut("api/projects/{projectId:int}/boq/lock")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<IActionResult> LockProjectBoq(int projectId)
        {
            await _boqService.LockProjectBoqAsync(projectId);

            return NoContent();
        }
    }
}
