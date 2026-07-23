namespace CostControlSystem.Application.Finance.DTOs.Responses
{
    public class EstimatedCostResponseDto
    {
        public int Id { get; set; }

        public int BOQItemId { get; set; }

        public decimal EstimatedUnitCost { get; set; }
    }
}
