using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Progress.DTOs.Requests
{
    public class UpdateProgressRequestDto
    {
        [Required]
        [Range(typeof(decimal), "0.01", "1000000",
            ErrorMessage = "Executed quantity must be between 0.01 and 1,000,000.")]
        public decimal QuantityDone { get; set; }

        [Required]
        public DateOnly ExecutionDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
