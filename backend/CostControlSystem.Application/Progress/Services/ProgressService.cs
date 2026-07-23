using CostControlSystem.Application.Exceptions;
using CostControlSystem.Application.Progress.DTOs.Requests;
using CostControlSystem.Application.Progress.DTOs.Responses;
using CostControlSystem.Application.Progress.Interfaces;
using CostControlSystem.Domain.Entities;
using CostControlSystem.Infrastructure.Data;
using CostControlSystem.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.Progress.Services
{
    public class ProgressService : IProgressService
    {
        private readonly CostControlSystemDbContext _context;

        public ProgressService(CostControlSystemDbContext context)
        {
            _context = context;
        }

        public async Task<List<BOQProgressSummaryResponseDto>> GetBOQSummaryAsync(int projectId)
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

                    ExecutedQuantity =
                        b.ProgressEntries
                            .Where(p => p.Status == ApprovalStatus.Approved)
                            .Sum(p => (decimal?)p.QuantityDone) ?? 0
                })
                .OrderBy(b => b.ItemNumber)
                .ToListAsync();

            return boqItems
                .Select(b => new BOQProgressSummaryResponseDto
                {
                    BOQItemId = b.Id,
                    ItemNumber = b.ItemNumber,
                    ItemName = b.ItemName,
                    Unit = b.Unit,
                    ContractQuantity = b.ContractQuantity,
                    ExecutedQuantity = b.ExecutedQuantity,
                    RemainingQuantity = b.ContractQuantity - b.ExecutedQuantity,
                    ProgressPercentage = b.ContractQuantity == 0
                        ? 0
                        : (b.ExecutedQuantity / b.ContractQuantity) * 100
                })
                .ToList();
        }

        public async Task<List<ProgressListItemResponseDto>> GetAllAsync(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            return await _context.ProgressEntries
                .AsNoTracking()
                .Where(p => p.ProjectId == projectId)
                .OrderByDescending(p => p.ExecutionDate)
                .Select(p => new ProgressListItemResponseDto
                {
                    Id = p.Id,
                    ItemNumber = p.BOQItem.ItemNumber,
                    ItemName = p.BOQItem.ItemName,
                    QuantityDone = p.QuantityDone,
                    ExecutionDate = p.ExecutionDate,
                    Status = p.Status,
                    SubmittedBy = p.CreatedByUser.FullName,
                    Notes = p.Notes,
                    ReviewerComment = p.ReviewerComment,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<ProgressListItemResponseDto> GetByIdAsync(int id)
        {
            var progress = await _context.ProgressEntries
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new ProgressListItemResponseDto
                {
                    Id = p.Id,
                    ItemNumber = p.BOQItem.ItemNumber,
                    ItemName = p.BOQItem.ItemName,
                    QuantityDone = p.QuantityDone,
                    ExecutionDate = p.ExecutionDate,
                    Status = p.Status,
                    SubmittedBy = p.CreatedByUser.FullName,
                    Notes = p.Notes,
                    ReviewerComment = p.ReviewerComment,
                    CreatedAt = p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (progress == null)
            {
                throw new NotFoundException($"Progress entry with id {id} was not found.");
            }

            return progress;
        }

        public async Task<ProgressListItemResponseDto> CreateAsync(int boqItemId, CreateProgressRequestDto dto, int currentUserId)
        {
            var boqItem = await _context.BOQItems.FindAsync(boqItemId);

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {boqItemId} was not found.");
            }

            if (!boqItem.IsLocked)
            {
                throw new BusinessRuleException("Progress cannot be recorded until the BOQ item is approved.");
            }

            var approvedQuantity = await _context.ProgressEntries
                .Where(p =>
                    p.BOQItemId == boqItemId &&
                    p.Status == ApprovalStatus.Approved)
                .SumAsync(p => (decimal?)p.QuantityDone) ?? 0;

            if (approvedQuantity + dto.QuantityDone > boqItem.Quantity)
            {
                throw new BusinessRuleException("Executed quantity cannot exceed contract quantity.");
            }

            var progressEntry = new ProgressEntry
            {
                ProjectId = boqItem.ProjectId,
                BOQItemId = boqItem.Id,
                QuantityDone = dto.QuantityDone,
                ExecutionDate = dto.ExecutionDate,
                Notes = dto.Notes,
                CreatedBy = currentUserId,
                Status = ApprovalStatus.Pending
            };

            _context.ProgressEntries.Add(progressEntry);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(progressEntry.Id);
        }

        public async Task<ProgressListItemResponseDto> UpdateAsync(int id, UpdateProgressRequestDto dto)
        {
            var progress = await _context.ProgressEntries
                .Include(p => p.BOQItem)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (progress == null)
            {
                throw new NotFoundException($"Progress entry with id {id} was not found.");
            }

            if (progress.Status != ApprovalStatus.Rejected)
            {
                throw new BusinessRuleException("Only rejected progress entries can be updated.");
            }

            if (!progress.BOQItem.IsLocked)
            {
                throw new BusinessRuleException("Progress cannot be recorded until the BOQ item is approved.");
            }

            var approvedQuantity = await _context.ProgressEntries
                .Where(p =>
                    p.BOQItemId == progress.BOQItemId &&
                    p.Status == ApprovalStatus.Approved &&
                    p.Id != progress.Id)
                .SumAsync(p => (decimal?)p.QuantityDone) ?? 0;

            if (approvedQuantity + dto.QuantityDone > progress.BOQItem.Quantity)
            {
                throw new BusinessRuleException("Executed quantity cannot exceed contract quantity.");
            }

            progress.QuantityDone = dto.QuantityDone;
            progress.ExecutionDate = dto.ExecutionDate;
            progress.Notes = dto.Notes;

            // Resubmitting the progress entry starts a new approval cycle
            progress.Status = ApprovalStatus.Pending;

            progress.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(progress.Id);
        }

        public async Task ApproveAsync(int id, int currentUserId)
        {
            var progress = await _context.ProgressEntries
                .Include(p => p.BOQItem)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (progress == null)
            {
                throw new NotFoundException($"Progress entry with id {id} was not found.");
            }

            if (progress.Status != ApprovalStatus.Pending)
            {
                throw new BusinessRuleException("Only pending progress entries can be approved.");
            }

            var approvedQuantity = await _context.ProgressEntries
                .Where(p =>
                    p.BOQItemId == progress.BOQItemId &&
                    p.Status == ApprovalStatus.Approved)
                .SumAsync(p => (decimal?)p.QuantityDone) ?? 0;

            if (approvedQuantity + progress.QuantityDone > progress.BOQItem.Quantity)
            {
                throw new BusinessRuleException("Executed quantity cannot exceed contract quantity.");
            }

            progress.Status = ApprovalStatus.Approved;

            progress.ApprovedBy = currentUserId;
            progress.ApprovedAt = DateTime.UtcNow;

            progress.ReviewerComment = null;

            progress.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task RejectAsync(int id, RejectProgressRequestDto dto, int currentUserId)
        {
            var progress = await _context.ProgressEntries.FindAsync(id);

            if (progress == null)
            {
                throw new NotFoundException($"Progress entry with id {id} was not found.");
            }

            if (progress.Status != ApprovalStatus.Pending)
            {
                throw new BusinessRuleException("Only pending progress entries can be rejected.");
            }

            progress.Status = ApprovalStatus.Rejected;

            progress.ReviewerComment = dto.ReviewerComment;

            progress.ApprovedBy = currentUserId;
            progress.ApprovedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
