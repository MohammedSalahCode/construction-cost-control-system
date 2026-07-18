using CostControlSystem.Application.BOQ.DTOs.Requests;
using CostControlSystem.Application.BOQ.DTOs.Responses;

namespace CostControlSystem.Application.BOQ.Interfaces
{
    public interface IBOQService
    {
        Task<List<BOQItemResponseDto>> GetProjectItemsAsync(int projectId);

        Task<BOQItemResponseDto> GetByIdAsync(int id);

        Task<BOQItemResponseDto> CreateAsync(int projectId, CreateBOQItemRequestDto dto);

        Task<BOQItemResponseDto> UpdateAsync(int id, UpdateBOQItemRequestDto dto);

        Task DeleteAsync(int id);

        Task LockProjectBoqAsync(int projectId);
    }
}
