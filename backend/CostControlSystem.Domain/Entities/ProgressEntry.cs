namespace CostControlSystem.Domain.Entities;

public partial class ProgressEntry
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public int BOQItemId { get; set; }

    public decimal QuantityDone { get; set; }

    public DateOnly ExecutionDate { get; set; }

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string Status { get; set; } = null!;

    public string? ReviewerComment { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public virtual User? ApprovedByUser { get; set; }

    public virtual BOQItem BOQItem { get; set; } = null!;

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
