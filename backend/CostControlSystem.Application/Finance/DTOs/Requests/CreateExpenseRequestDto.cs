using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.Finance.DTOs.Requests
{
    public class CreateExpenseRequestDto
    {
        [Required]
        [Range(typeof(decimal), "0.01", "9999999999999999.99")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(20)]
        public string ExpenseType { get; set; } = string.Empty;

        public int? BOQItemId { get; set; }

        [Required]
        public DateOnly ExpenseDate { get; set; }

        [StringLength(100)]
        public string? ReferenceNumber { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }
    }
}
