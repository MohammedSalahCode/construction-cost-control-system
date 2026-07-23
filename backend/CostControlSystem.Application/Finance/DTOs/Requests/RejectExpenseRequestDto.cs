using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Finance.DTOs.Requests
{
    public class RejectExpenseRequestDto
    {
        [Required]
        [StringLength(1000)]
        public string ReviewerComment { get; set; } = string.Empty;
    }
}
