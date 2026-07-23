using CostControlSystem.API.Extensions;
using CostControlSystem.Application.Finance.DTOs.Requests;
using CostControlSystem.Application.Finance.DTOs.Responses;
using CostControlSystem.Application.Finance.Interfaces;
using CostControlSystem.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [Route("api")]
    [ApiController]
    [Authorize]
    public class FinanceController : ControllerBase
    {
        private readonly IFinanceService _financeService;

        public FinanceController(IFinanceService financeService)
        {
            _financeService = financeService;
        }

        // ====================
        // Expenses 
        // ====================

        [HttpGet("projects/{projectId:int}/expenses/summary")]
        public async Task<ActionResult<List<BOQExpenseSummaryResponseDto>>> GetBOQSummary(int projectId)
        {
            var summary = await _financeService.GetBOQSummaryAsync(projectId);

            return Ok(summary);
        }

        [HttpGet("projects/{projectId:int}/expenses")]
        public async Task<ActionResult<List<ExpenseListItemResponseDto>>> GetAll(int projectId)
        {
            var expenses = await _financeService.GetAllAsync(projectId);

            return Ok(expenses);
        }

        [HttpGet("expenses/{id:int}")]
        public async Task<ActionResult<ExpenseListItemResponseDto>> GetById(int id)
        {
            var expense = await _financeService.GetByIdAsync(id);

            return Ok(expense);
        }

        [HttpPost("projects/{projectId:int}/expenses")]
        [Authorize(Roles = RoleNames.Accountant)]
        public async Task<ActionResult<ExpenseListItemResponseDto>> Create(int projectId, [FromBody] CreateExpenseRequestDto dto)
        {
            var currentUserId = User.GetCurrentUserId();

            var expense = await _financeService.CreateAsync(projectId, dto, currentUserId);

            return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
        }

        [HttpPut("expenses/{id:int}")]
        [Authorize(Roles = RoleNames.Accountant)]
        public async Task<ActionResult<ExpenseListItemResponseDto>> Update(int id, [FromBody] UpdateExpenseRequestDto dto)
        {
            var expense = await _financeService.UpdateAsync(id, dto);

            return Ok(expense);
        }

        [HttpPost("expenses/{id:int}/approve")]
        [Authorize(Roles = RoleNames.FinanceManager)]
        public async Task<IActionResult> Approve(int id)
        {
            var currentUserId = User.GetCurrentUserId();

            await _financeService.ApproveAsync(id, currentUserId);

            return NoContent();
        }

        [HttpPost("expenses/{id:int}/reject")]
        [Authorize(Roles = RoleNames.FinanceManager)]
        public async Task<IActionResult> Reject(int id, [FromBody] RejectExpenseRequestDto dto)
        {
            var currentUserId = User.GetCurrentUserId();

            await _financeService.RejectAsync(id, dto, currentUserId);

            return NoContent();
        }


        // ====================
        // Estimated Costs
        // ====================

        [HttpPost("boq/{boqItemId:int}/estimated-cost")]
        [Authorize(Roles = RoleNames.CostController)]
        public async Task<ActionResult<EstimatedCostResponseDto>> CreateEstimatedCost(int boqItemId, [FromBody] CreateEstimatedCostRequestDto dto)
        {
            var estimatedCost = await _financeService.CreateEstimatedCostAsync(boqItemId, dto);

            return Ok(estimatedCost);
        }

        [HttpPut("boq/{boqItemId:int}/estimated-cost")]
        [Authorize(Roles = RoleNames.CostController)]
        public async Task<ActionResult<EstimatedCostResponseDto>> UpdateEstimatedCost(int boqItemId, [FromBody] UpdateEstimatedCostRequestDto dto)
        {
            var estimatedCost = await _financeService.UpdateEstimatedCostAsync(boqItemId, dto);

            return Ok(estimatedCost);
        }
    }
}
