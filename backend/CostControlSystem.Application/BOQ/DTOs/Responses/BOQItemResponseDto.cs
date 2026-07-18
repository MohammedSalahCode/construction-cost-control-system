namespace CostControlSystem.Application.BOQ.DTOs.Responses
{
    public class BOQItemResponseDto
    {
        public int Id { get; set; }

        public int ProjectId { get; set; }

        public string ItemNumber { get; set; } = string.Empty;

        public string ItemName { get; set; } = string.Empty;

        public string Unit { get; set; } = string.Empty;

        public decimal Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal TotalPrice { get; set; }

        public string? Notes { get; set; }

        public bool IsLocked { get; set; }
    }
}
