using CostControlSystem.Application.Finance.DTOs.Requests;
using CostControlSystem.Application.Finance.DTOs.Responses;

namespace CostControlSystem.Application.Finance.Interfaces
{
    public interface IFinanceService
    {
        // Expense Requests

        Task<List<BOQExpenseSummaryResponseDto>> GetBOQSummaryAsync(int projectId);

        Task<List<ExpenseListItemResponseDto>> GetAllAsync(int projectId);

        Task<ExpenseListItemResponseDto> GetByIdAsync(int id);

        Task<ExpenseListItemResponseDto> CreateAsync(int projectId, CreateExpenseRequestDto dto, int currentUserId);

        Task<ExpenseListItemResponseDto> UpdateAsync(int id, UpdateExpenseRequestDto dto);

        Task ApproveAsync(int id, int currentUserId);

        Task RejectAsync(int id, RejectExpenseRequestDto dto, int currentUserId);


        // Estimated Costs

        Task<EstimatedCostResponseDto> CreateEstimatedCostAsync(int boqItemId, CreateEstimatedCostRequestDto dto);

        Task<EstimatedCostResponseDto> UpdateEstimatedCostAsync(int boqItemId, UpdateEstimatedCostRequestDto dto);
    }
}
