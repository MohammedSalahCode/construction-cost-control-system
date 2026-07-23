using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Progress.DTOs.Requests
{
    public class RejectProgressRequestDto
    {
        [Required]
        [MaxLength(1000)]
        public string ReviewerComment { get; set; } = string.Empty;
    }
}
