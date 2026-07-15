using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Projects.DTOs.Requests
{
    public class CreateProjectRequestDto
    {
        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }
    }
}
