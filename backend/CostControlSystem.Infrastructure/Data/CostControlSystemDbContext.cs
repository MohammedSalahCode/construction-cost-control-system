using CostControlSystem.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Infrastructure.Data;

public partial class CostControlSystemDbContext : DbContext
{
    public CostControlSystemDbContext()
    {
    }

    public CostControlSystemDbContext(DbContextOptions<CostControlSystemDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BOQItem> BOQItems { get; set; }

    public virtual DbSet<EstimatedCost> EstimatedCosts { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<ProgressEntry> ProgressEntries { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CostControlSystemDbContext).Assembly);
    }
}
