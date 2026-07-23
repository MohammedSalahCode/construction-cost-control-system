using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Finance.DTOs.Requests
{
    public class CreateEstimatedCostRequestDto
    {
        [Required]
        [Range(typeof(decimal), "0.01", "9999999999999999.99")]
        public decimal EstimatedUnitCost { get; set; }
    }
}
