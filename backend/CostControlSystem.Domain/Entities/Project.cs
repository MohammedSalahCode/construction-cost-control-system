using System;
using System.Collections.Generic;

namespace CostControlSystem.Domain.Entities;

public partial class Project
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public int CreatedBy { get; set; }

    public virtual ICollection<BOQItem> BOQItems { get; set; } = new List<BOQItem>();

    public virtual User CreatedByUser { get; set; } = null!;

    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

    public virtual ICollection<ProgressEntry> ProgressEntries { get; set; } = new List<ProgressEntry>();
}
