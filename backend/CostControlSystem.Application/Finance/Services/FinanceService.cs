using CostControlSystem.Application.Exceptions;
using CostControlSystem.Application.Finance.DTOs.Requests;
using CostControlSystem.Application.Finance.DTOs.Responses;
using CostControlSystem.Application.Finance.Interfaces;
using CostControlSystem.Domain.Entities;
using CostControlSystem.Infrastructure.Data;
using CostControlSystem.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.Finance.Services
{
    public class FinanceService : IFinanceService
    {
        private readonly CostControlSystemDbContext _context;

        public FinanceService(CostControlSystemDbContext context)
        {
            _context = context;
        }

        // ==========================================================
        // Expenses
        // ==========================================================

        public async Task<List<BOQExpenseSummaryResponseDto>> GetBOQSummaryAsync(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            var boqItems = await _context.BOQItems
                .AsNoTracking()
                .Where(b => b.ProjectId == projectId)
                .Select(b => new
                {
                    b.Id,
                    b.ItemNumber,
                    b.ItemName,
                    b.Unit,
                    ContractQuantity = b.Quantity,
                    UnitPrice = b.UnitPrice,
                    ContractValue = b.TotalPrice ?? 0,

                    TotalApprovedExpenses =
                        b.Expenses
                            .Where(e => e.Status == ApprovalStatus.Approved)
                            .Sum(e => (decimal?)e.Amount) ?? 0
                })
                .OrderBy(b => b.ItemNumber)
                .ToListAsync();

            return boqItems
                .Select(b => new BOQExpenseSummaryResponseDto
                {
                    BOQItemId = b.Id,
                    ItemNumber = b.ItemNumber,
                    ItemName = b.ItemName,
                    Unit = b.Unit,
                    ContractQuantity = b.ContractQuantity,
                    UnitPrice = b.UnitPrice,
                    ContractValue = b.ContractValue,
                    TotalApprovedExpenses = b.TotalApprovedExpenses
                })
                .ToList();
        }

        public async Task<List<ExpenseListItemResponseDto>> GetAllAsync(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            return await _context.Expenses
                .AsNoTracking()
                .Where(e => e.ProjectId == projectId)
                .OrderByDescending(e => e.ExpenseDate)
                .Select(e => new ExpenseListItemResponseDto
                {
                    Id = e.Id,
                    ExpenseType = e.ExpenseType,
                    ItemNumber = e.BOQItem == null ? null : e.BOQItem.ItemNumber,
                    ItemName = e.BOQItem == null ? null : e.BOQItem.ItemName,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    SubmittedBy = e.CreatedByUser.FullName,
                    ReferenceNumber = e.ReferenceNumber,
                    Description = e.Description,
                    ReviewerComment = e.ReviewerComment,
                    CreatedAt = e.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ExpenseListItemResponseDto> GetByIdAsync(int id)
        {
            var expense = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.Id == id)
                .Select(e => new ExpenseListItemResponseDto
                {
                    Id = e.Id,
                    ExpenseType = e.ExpenseType,
                    ItemNumber = e.BOQItem == null ? null : e.BOQItem.ItemNumber,
                    ItemName = e.BOQItem == null ? null : e.BOQItem.ItemName,
                    Amount = e.Amount,
                    ExpenseDate = e.ExpenseDate,
                    Status = e.Status,
                    SubmittedBy = e.CreatedByUser.FullName,
                    ReferenceNumber = e.ReferenceNumber,
                    Description = e.Description,
                    ReviewerComment = e.ReviewerComment,
                    CreatedAt = e.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (expense == null)
            {
                throw new NotFoundException($"Expense entry with id {id} was not found.");
            }

            return expense;
        }

        public async Task<ExpenseListItemResponseDto> CreateAsync(int projectId, CreateExpenseRequestDto dto, int currentUserId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            if (dto.ExpenseType != ExpenseTypes.Direct &&
                dto.ExpenseType != ExpenseTypes.Indirect &&
                dto.ExpenseType != ExpenseTypes.Overhead)
            {
                throw new BusinessRuleException("Invalid expense type.");
            }

            if (dto.ExpenseType == ExpenseTypes.Direct && dto.BOQItemId == null)
            {
                throw new BusinessRuleException("BOQ item is required for direct expenses.");
            }

            if (dto.ExpenseType != ExpenseTypes.Direct && dto.BOQItemId != null)
            {
                throw new BusinessRuleException("Only direct expenses can be linked to a BOQ item.");
            }


            if (dto.ExpenseType == ExpenseTypes.Direct)
            {
                var boqItem = await _context.BOQItems.FindAsync(dto.BOQItemId!.Value);

                if (boqItem == null)
                {
                    throw new NotFoundException($"BOQ item with id {dto.BOQItemId} was not found.");
                }

                if (boqItem.ProjectId != projectId)
                {
                    throw new BusinessRuleException("The selected BOQ item does not belong to the specified project.");
                }

                if (!boqItem.IsLocked)
                {
                    throw new BusinessRuleException("Expenses cannot be recorded until the BOQ item is approved.");
                }
            }

            var expense = new Expense
            {
                ProjectId = projectId,
                BOQItemId = dto.BOQItemId,
                Amount = dto.Amount,
                ExpenseType = dto.ExpenseType,
                ExpenseDate = dto.ExpenseDate,
                ReferenceNumber = dto.ReferenceNumber,
                Description = dto.Description,
                CreatedBy = currentUserId,
                Status = ApprovalStatus.Pending
            };

            _context.Expenses.Add(expense);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(expense.Id);
        }

        public async Task<ExpenseListItemResponseDto> UpdateAsync(int id, UpdateExpenseRequestDto dto)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                throw new NotFoundException($"Expense entry with id {id} was not found.");
            }

            if (expense.Status != ApprovalStatus.Rejected)
            {
                throw new BusinessRuleException("Only rejected expense entries can be updated.");
            }

            if (dto.ExpenseType != ExpenseTypes.Direct &&
                dto.ExpenseType != ExpenseTypes.Indirect &&
                dto.ExpenseType != ExpenseTypes.Overhead)
            {
                throw new BusinessRuleException("Invalid expense type.");
            }

            if (dto.ExpenseType == ExpenseTypes.Direct && dto.BOQItemId == null)
            {
                throw new BusinessRuleException("BOQ item is required for direct expenses.");
            }

            if (dto.ExpenseType != ExpenseTypes.Direct && dto.BOQItemId != null)
            {
                throw new BusinessRuleException("Only direct expenses can be linked to a BOQ item.");
            }

            if (dto.ExpenseType == ExpenseTypes.Direct)
            {
                var boqItem = await _context.BOQItems.FindAsync(dto.BOQItemId!.Value);

                if (boqItem == null)
                {
                    throw new NotFoundException($"BOQ item with id {dto.BOQItemId} was not found.");
                }

                if (boqItem.ProjectId != expense.ProjectId)
                {
                    throw new BusinessRuleException("The selected BOQ item does not belong to the specified project.");
                }

                if (!boqItem.IsLocked)
                {
                    throw new BusinessRuleException("Expenses cannot be recorded until the BOQ item is approved.");
                }
            }

            expense.BOQItemId = dto.BOQItemId;
            expense.Amount = dto.Amount;
            expense.ExpenseType = dto.ExpenseType;
            expense.ExpenseDate = dto.ExpenseDate;
            expense.ReferenceNumber = dto.ReferenceNumber;
            expense.Description = dto.Description;

            // Resubmitting the expense entry starts a new approval cycle
            expense.Status = ApprovalStatus.Pending;

            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(expense.Id);
        }

        public async Task ApproveAsync(int id, int currentUserId)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                throw new NotFoundException($"Expense entry with id {id} was not found.");
            }

            if (expense.Status != ApprovalStatus.Pending)
            {
                throw new BusinessRuleException("Only pending expense entries can be approved.");
            }

            expense.Status = ApprovalStatus.Approved;

            expense.ApprovedBy = currentUserId;
            expense.ApprovedAt = DateTime.UtcNow;

            expense.ReviewerComment = null;

            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task RejectAsync(int id, RejectExpenseRequestDto dto, int currentUserId)
        {
            var expense = await _context.Expenses.FindAsync(id);

            if (expense == null)
            {
                throw new NotFoundException($"Expense entry with id {id} was not found.");
            }

            if (expense.Status != ApprovalStatus.Pending)
            {
                throw new BusinessRuleException("Only pending expense entries can be rejected.");
            }

            expense.Status = ApprovalStatus.Rejected;

            expense.ReviewerComment = dto.ReviewerComment;

            expense.ApprovedBy = currentUserId;
            expense.ApprovedAt = DateTime.UtcNow;
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }


        // ==========================================================
        // Estimated Costs
        // ==========================================================

        public async Task<EstimatedCostResponseDto> CreateEstimatedCostAsync(int boqItemId, CreateEstimatedCostRequestDto dto)
        {
            var boqItem = await _context.BOQItems.FindAsync(boqItemId);

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {boqItemId} was not found.");
            }

            if (!boqItem.IsLocked)
            {
                throw new BusinessRuleException("Estimated cost cannot be recorded until the BOQ item is approved.");
            }

            var estimatedCostExists = await _context.EstimatedCosts
                .AnyAsync(e => e.BOQItemId == boqItemId);

            if (estimatedCostExists)
            {
                throw new BusinessRuleException("Estimated cost already exists for this BOQ item.");
            }

            var estimatedCost = new EstimatedCost
            {
                BOQItemId = boqItemId,
                EstimatedUnitCost = dto.EstimatedUnitCost
            };

            _context.EstimatedCosts.Add(estimatedCost);

            await _context.SaveChangesAsync();

            return new EstimatedCostResponseDto
            {
                Id = estimatedCost.Id,
                BOQItemId = estimatedCost.BOQItemId,
                EstimatedUnitCost = estimatedCost.EstimatedUnitCost
            };
        }

        public async Task<EstimatedCostResponseDto> UpdateEstimatedCostAsync(int boqItemId, UpdateEstimatedCostRequestDto dto)
        {
            var boqItem = await _context.BOQItems.FindAsync(boqItemId);

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {boqItemId} was not found.");
            }

            if (!boqItem.IsLocked)
            {
                throw new BusinessRuleException("Estimated cost cannot be updated until the BOQ item is approved.");
            }

            var estimatedCost = await _context.EstimatedCosts
                .FirstOrDefaultAsync(e => e.BOQItemId == boqItemId);

            if (estimatedCost == null)
            {
                throw new NotFoundException($"Estimated cost for BOQ item with id {boqItemId} was not found.");
            }

            estimatedCost.EstimatedUnitCost = dto.EstimatedUnitCost;
            estimatedCost.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new EstimatedCostResponseDto
            {
                Id = estimatedCost.Id,
                BOQItemId = estimatedCost.BOQItemId,
                EstimatedUnitCost = estimatedCost.EstimatedUnitCost
            };
        }
    }
}
