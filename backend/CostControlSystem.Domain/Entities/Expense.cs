namespace CostControlSystem.Domain.Entities;

public partial class Expense
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public int? BOQItemId { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public string ExpenseType { get; set; } = null!;

    public DateOnly ExpenseDate { get; set; }

    public string Status { get; set; } = null!;

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? ReviewerComment { get; set; }

    public string? ReferenceNumber { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public virtual User? ApprovedByUser { get; set; }

    public virtual BOQItem? BOQItem { get; set; }

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
