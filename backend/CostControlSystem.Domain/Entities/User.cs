using System;
using System.Collections.Generic;

namespace CostControlSystem.Domain.Entities;

public partial class User
{
    public int Id { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public int RoleId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<Expense> ExpenseApprovedByNavigations { get; set; } = new List<Expense>();

    public virtual ICollection<Expense> ExpenseCreatedByNavigations { get; set; } = new List<Expense>();

    public virtual ICollection<ProgressEntry> ProgressEntryApprovedByNavigations { get; set; } = new List<ProgressEntry>();

    public virtual ICollection<ProgressEntry> ProgressEntryCreatedByNavigations { get; set; } = new List<ProgressEntry>();

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual Role Role { get; set; } = null!;
}
