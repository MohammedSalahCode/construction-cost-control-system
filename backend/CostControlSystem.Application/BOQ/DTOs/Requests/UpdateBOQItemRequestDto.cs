using System.ComponentModel.DataAnnotations;

namespace CostControlSystem.Application.BOQ.DTOs.Requests
{
    public class UpdateBOQItemRequestDto
    {
        [Required]
        [StringLength(20)]
        [RegularExpression(@"^\d+(\.\d+)*$", ErrorMessage = "Invalid BOQ item number format.")]
        public string ItemNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Unit { get; set; } = string.Empty;

        [Required]
        public decimal Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }
    }
}
