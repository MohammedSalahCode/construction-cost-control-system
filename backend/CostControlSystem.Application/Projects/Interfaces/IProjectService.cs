using CostControlSystem.Application.Projects.DTOs.Requests;
using CostControlSystem.Application.Projects.DTOs.Responses;

namespace CostControlSystem.Application.Projects.Interfaces
{
    public interface IProjectService
    {
        Task<List<ProjectResponseDto>> GetAllAsync();

        Task<ProjectResponseDto> GetByIdAsync(int id);

        Task<ProjectResponseDto> CreateAsync(CreateProjectRequestDto dto, int currentUserId);

        Task<ProjectResponseDto> UpdateAsync(int id, UpdateProjectRequestDto dto);
    }
}
