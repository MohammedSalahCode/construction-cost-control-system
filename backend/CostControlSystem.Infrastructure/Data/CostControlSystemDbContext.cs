using System;
using System.Collections.Generic;
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

    public virtual DbSet<Boqitem> Boqitems { get; set; }

    public virtual DbSet<EstimatedCost> EstimatedCosts { get; set; }

    public virtual DbSet<Expense> Expenses { get; set; }

    public virtual DbSet<ProgressEntry> ProgressEntries { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Boqitem>(entity =>
        {
            entity.ToTable("BOQItems");

            entity.HasIndex(e => e.ProjectId, "IX_BOQItems_ProjectId");

            entity.HasIndex(e => new { e.ProjectId, e.ItemNumber }, "UQ_BOQItems_Project_ItemNumber").IsUnique();

            entity.Property(e => e.ItemName).HasMaxLength(255);
            entity.Property(e => e.ItemNumber).HasMaxLength(20);
            entity.Property(e => e.Notes).HasMaxLength(500);
            entity.Property(e => e.Quantity).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.TotalPrice)
                .HasComputedColumnSql("([Quantity]*[UnitPrice])", true)
                .HasColumnType("decimal(37, 4)");
            entity.Property(e => e.Unit).HasMaxLength(50);
            entity.Property(e => e.UnitPrice).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Project).WithMany(p => p.Boqitems)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_BOQItems_Projects");
        });

        modelBuilder.Entity<EstimatedCost>(entity =>
        {
            entity.HasIndex(e => e.BoqitemId, "IX_EstimatedCosts_BOQItemId");

            entity.HasIndex(e => e.BoqitemId, "UQ_EstimatedCosts_BOQItemId").IsUnique();

            entity.Property(e => e.BoqitemId).HasColumnName("BOQItemId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EstimatedUnitCost).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Boqitem).WithOne(p => p.EstimatedCost)
                .HasForeignKey<EstimatedCost>(d => d.BoqitemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_EstimatedCosts_BOQItems");
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.HasIndex(e => e.BoqitemId, "IX_Expenses_BOQItemId");

            entity.HasIndex(e => e.ProjectId, "IX_Expenses_ProjectId");

            entity.HasIndex(e => e.Status, "IX_Expenses_Status");

            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.ApprovedAt).HasColumnType("datetime");
            entity.Property(e => e.BoqitemId).HasColumnName("BOQItemId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.ExpenseType).HasMaxLength(20);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ExpenseApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK_Expenses_ApprovedBy");

            entity.HasOne(d => d.Boqitem).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.BoqitemId)
                .HasConstraintName("FK_Expenses_BOQItems");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ExpenseCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Expenses_CreatedBy");

            entity.HasOne(d => d.Project).WithMany(p => p.Expenses)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Expenses_Projects");
        });

        modelBuilder.Entity<ProgressEntry>(entity =>
        {
            entity.HasIndex(e => e.BoqitemId, "IX_ProgressEntries_BOQItemId");

            entity.HasIndex(e => e.ProjectId, "IX_ProgressEntries_ProjectId");

            entity.Property(e => e.ApprovedAt).HasColumnType("datetime");
            entity.Property(e => e.BoqitemId).HasColumnName("BOQItemId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.QuantityDone).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.ProgressEntryApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .HasConstraintName("FK_ProgressEntries_ApprovedBy");

            entity.HasOne(d => d.Boqitem).WithMany(p => p.ProgressEntries)
                .HasForeignKey(d => d.BoqitemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProgressEntries_BOQItems");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ProgressEntryCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProgressEntries_CreatedBy");

            entity.HasOne(d => d.Project).WithMany(p => p.ProgressEntries)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProgressEntries_Projects");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.Name).HasMaxLength(150);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Projects)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Projects_Users");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(e => e.TokenHash, "UQ_RefreshTokens_TokenHash").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ExpiresAt).HasColumnType("datetime");
            entity.Property(e => e.RevokedAt).HasColumnType("datetime");
            entity.Property(e => e.TokenHash).HasMaxLength(255);

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_RefreshTokens_Users");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasIndex(e => e.Name, "UQ_Roles_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(50);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "UQ_Users_Email").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Users_Roles");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
