using System;
using System.Collections.Generic;

namespace CostControlSystem.Domain.Entities;

public partial class BOQItem
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    public string ItemNumber { get; set; } = null!;

    public string ItemName { get; set; } = null!;

    public string Unit { get; set; } = null!;

    public decimal Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal? TotalPrice { get; set; }

    public string? Notes { get; set; }

    public bool IsLocked { get; set; }

    public virtual EstimatedCost? EstimatedCost { get; set; }

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<ProgressEntry> ProgressEntries { get; set; } = new List<ProgressEntry>();

    public virtual Project Project { get; set; } = null!;
}
