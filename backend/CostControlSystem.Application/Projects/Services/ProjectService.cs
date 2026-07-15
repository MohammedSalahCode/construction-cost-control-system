using CostControlSystem.Application.Projects.DTOs.Requests;
using CostControlSystem.Application.Projects.DTOs.Responses;
using CostControlSystem.Application.Projects.Interfaces;
using CostControlSystem.Application.Exceptions;
using CostControlSystem.Domain.Entities;
using CostControlSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.Projects.Services
{
    public class ProjectService : IProjectService
    {
        private readonly CostControlSystemDbContext _context;

        public ProjectService(CostControlSystemDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProjectResponseDto>> GetAllAsync()
        {
            return await _context.Projects
                .AsNoTracking()
                .OrderBy(p => p.Name)
                .Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate
                })
                .ToListAsync();
        }

        public async Task<ProjectResponseDto> GetByIdAsync(int id)
        {
            var project = await _context.Projects
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new ProjectResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate
                })
                .FirstOrDefaultAsync();

            if (project == null)
            {
                throw new NotFoundException($"Project with id {id} was not found.");
            }

            return project;
        }

        public async Task<ProjectResponseDto> CreateAsync(CreateProjectRequestDto dto, int currentUserId)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedBy = currentUserId,
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return new ProjectResponseDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
            };
        }

        public async Task<ProjectResponseDto> UpdateAsync(int id, UpdateProjectRequestDto dto)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                throw new NotFoundException($"Project with id {id} was not found.");
            }

            project.Name = dto.Name;
            project.Description = dto.Description;
            project.EndDate = dto.EndDate;

            await _context.SaveChangesAsync();

            return new ProjectResponseDto
            {
                Id = project.Id,
                Name = project.Name,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
            };
        }
    }
}
