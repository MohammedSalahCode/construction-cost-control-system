using CostControlSystem.Application.Progress.DTOs.Requests;
using CostControlSystem.Application.Progress.DTOs.Responses;

namespace CostControlSystem.Application.Progress.Interfaces
{
    public interface IProgressService
    {
        Task<List<BOQProgressSummaryResponseDto>> GetBOQSummaryAsync(int projectId);

        Task<List<ProgressListItemResponseDto>> GetAllAsync(int projectId);

        Task<ProgressListItemResponseDto> GetByIdAsync(int id);

        Task<ProgressListItemResponseDto> CreateAsync(int boqItemId, CreateProgressRequestDto dto, int currentUserId);

        Task<ProgressListItemResponseDto> UpdateAsync(int id, UpdateProgressRequestDto dto);

        Task ApproveAsync(int id, int currentUserId);

        Task RejectAsync(int id, RejectProgressRequestDto dto, int currentUserId);
    }
}
