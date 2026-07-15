using CostControlSystem.API.Extensions;
using CostControlSystem.Application.Projects.DTOs.Requests;
using CostControlSystem.Application.Projects.DTOs.Responses;
using CostControlSystem.Application.Projects.Interfaces;
using CostControlSystem.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CostControlSystem.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }


        [HttpGet]
        public async Task<ActionResult<List<ProjectResponseDto>>> GetAll()
        {
            var projects = await _projectService.GetAllAsync();

            return Ok(projects);
        }


        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProjectResponseDto>> GetById(int id)
        {
            var project = await _projectService.GetByIdAsync(id);
            return Ok(project);
        }


        [HttpPost]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<ProjectResponseDto>> Create([FromBody] CreateProjectRequestDto dto)
        {
            int currentUserId = User.GetCurrentUserId();

            var project = await _projectService.CreateAsync(dto, currentUserId);

            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }


        [HttpPut("{id:int}")]
        [Authorize(Roles = RoleNames.Admin)]
        public async Task<ActionResult<ProjectResponseDto>> Update(int id, [FromBody] UpdateProjectRequestDto dto)
        {
            var project = await _projectService.UpdateAsync(id, dto);

            return Ok(project);
        }
    }
}
