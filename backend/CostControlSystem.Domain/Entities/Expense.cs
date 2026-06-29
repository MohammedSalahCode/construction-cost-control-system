using System;
using System.Collections.Generic;

namespace CostControlSystem.Domain.Entities;

public partial class Expense
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public int? BoqitemId { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public string ExpenseType { get; set; } = null!;

    public string Status { get; set; } = null!;

    public int CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public int? ApprovedBy { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public virtual User? ApprovedByNavigation { get; set; }

    public virtual Boqitem? Boqitem { get; set; }

    public virtual User CreatedByNavigation { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
