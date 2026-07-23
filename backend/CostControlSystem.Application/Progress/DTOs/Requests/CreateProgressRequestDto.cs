using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Progress.DTOs.Requests
{
    public class CreateProgressRequestDto
    {
        [Required]
        [Range(typeof(decimal), "0.01", "999999999999999.99")]
        public decimal QuantityDone { get; set; }

        [Required]
        public DateOnly ExecutionDate { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }
}
