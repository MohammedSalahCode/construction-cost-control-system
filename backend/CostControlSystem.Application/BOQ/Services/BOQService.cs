using CostControlSystem.Application.BOQ.DTOs.Requests;
using CostControlSystem.Application.BOQ.DTOs.Responses;
using CostControlSystem.Application.BOQ.Interfaces;
using CostControlSystem.Application.Exceptions;
using CostControlSystem.Domain.Entities;
using CostControlSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CostControlSystem.Application.BOQ.Services
{
    public class BOQService : IBOQService
    {
        private readonly CostControlSystemDbContext _context;

        public BOQService(CostControlSystemDbContext context)
        {
            _context = context;
        }

        public async Task<List<BOQItemResponseDto>> GetProjectItemsAsync(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }

            var boqItems = await _context.BOQItems
                .AsNoTracking()
                .Where(item => item.ProjectId == projectId)
                .ToListAsync();

            return boqItems
                .OrderBy(item => GetSortableItemNumber(item.ItemNumber))
                .Select(item => new BOQItemResponseDto
                {
                    Id = item.Id,
                    ProjectId = item.ProjectId,
                    ItemNumber = item.ItemNumber,
                    ItemName = item.ItemName,
                    Unit = item.Unit,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice!.Value,
                    Notes = item.Notes,
                    IsLocked = item.IsLocked
                })
                .ToList();
        }

        public async Task<BOQItemResponseDto> GetByIdAsync(int id)
        {
            var boqItem = await _context.BOQItems
                .AsNoTracking()
                .Where(item => item.Id == id)
                .Select(item => new BOQItemResponseDto
                {
                    Id = item.Id,
                    ProjectId = item.ProjectId,
                    ItemNumber = item.ItemNumber,
                    ItemName = item.ItemName,
                    Unit = item.Unit,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice!.Value,
                    Notes = item.Notes,
                    IsLocked = item.IsLocked
                })
                .FirstOrDefaultAsync();

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {id} was not found.");
            }

            return boqItem;
        }

        public async Task<BOQItemResponseDto> CreateAsync(int projectId, CreateBOQItemRequestDto dto)
        {
            NormalizeBoqItem(dto);

            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }


            var isLocked = await _context.BOQItems
                .AnyAsync(item => item.ProjectId == projectId && item.IsLocked);

            if (isLocked)
            {
                throw new BusinessRuleException("The BOQ is locked and cannot be modified.");
            }


            var itemNumberExists = await _context.BOQItems
                .AnyAsync(item =>
                    item.ProjectId == projectId &&
                    item.ItemNumber == dto.ItemNumber);

            if (itemNumberExists)
            {
                throw new ConflictException($"BOQ item number {dto.ItemNumber} already exists in this project.");
            }

            var boqItem = new BOQItem
            {
                ProjectId = projectId,
                ItemNumber = dto.ItemNumber,
                ItemName = dto.ItemName,
                Unit = dto.Unit,
                Quantity = dto.Quantity,
                UnitPrice = dto.UnitPrice,
                Notes = dto.Notes
            };

            _context.BOQItems.Add(boqItem);

            await _context.SaveChangesAsync();

            return new BOQItemResponseDto
            {
                Id = boqItem.Id,
                ProjectId = boqItem.ProjectId,
                ItemNumber = boqItem.ItemNumber,
                ItemName = boqItem.ItemName,
                Unit = boqItem.Unit,
                Quantity = boqItem.Quantity,
                UnitPrice = boqItem.UnitPrice,
                TotalPrice = boqItem.TotalPrice!.Value,
                Notes = boqItem.Notes,
                IsLocked = boqItem.IsLocked
            };
        }

        public async Task<BOQItemResponseDto> UpdateAsync(int id, UpdateBOQItemRequestDto dto)
        {
            NormalizeBoqItem(dto);

            var boqItem = await _context.BOQItems
                .FirstOrDefaultAsync(item => item.Id == id);

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {id} was not found.");
            }


            var isLocked = await _context.BOQItems
                .AnyAsync(item =>
                    item.ProjectId == boqItem.ProjectId &&
                    item.IsLocked);

            if (isLocked)
            {
                throw new BusinessRuleException("The BOQ is locked and cannot be modified.");
            }


            var itemNumberExists = await _context.BOQItems
                .AnyAsync(item =>
                    item.ProjectId == boqItem.ProjectId &&
                    item.ItemNumber == dto.ItemNumber &&
                    item.Id != id);

            if (itemNumberExists)
            {
                throw new ConflictException($"BOQ item number {dto.ItemNumber} already exists in this project.");
            }


            boqItem.ItemNumber = dto.ItemNumber;
            boqItem.ItemName = dto.ItemName;
            boqItem.Unit = dto.Unit;
            boqItem.Quantity = dto.Quantity;
            boqItem.UnitPrice = dto.UnitPrice;
            boqItem.Notes = dto.Notes;

            await _context.SaveChangesAsync();

            return new BOQItemResponseDto
            {
                Id = boqItem.Id,
                ProjectId = boqItem.ProjectId,
                ItemNumber = boqItem.ItemNumber,
                ItemName = boqItem.ItemName,
                Unit = boqItem.Unit,
                Quantity = boqItem.Quantity,
                UnitPrice = boqItem.UnitPrice,
                TotalPrice = boqItem.TotalPrice!.Value,
                Notes = boqItem.Notes,
                IsLocked = boqItem.IsLocked
            };
        }

        public async Task DeleteAsync(int id)
        {
            var boqItem = await _context.BOQItems
                .FirstOrDefaultAsync(item => item.Id == id);

            if (boqItem == null)
            {
                throw new NotFoundException($"BOQ item with id {id} was not found.");
            }


            if (boqItem.IsLocked)
            {
                throw new BusinessRuleException("The BOQ item is locked and cannot be deleted.");
            }


            var hasProgress = await _context.ProgressEntries
                .AnyAsync(progress => progress.BOQItemId == id);

            if (hasProgress)
            {
                throw new BusinessRuleException("Cannot delete BOQ item because it has progress records.");
            }


            var hasExpenses = await _context.Expenses
                .AnyAsync(expense => expense.BOQItemId == id);

            if (hasExpenses)
            {
                throw new BusinessRuleException("Cannot delete BOQ item because it has expense records.");
            }


            var hasEstimatedCost = await _context.EstimatedCosts
                .AnyAsync(cost => cost.BOQItemId == id);

            if (hasEstimatedCost)
            {
                throw new BusinessRuleException("Cannot delete BOQ item because it has estimated cost.");
            }


            _context.BOQItems.Remove(boqItem);

            await _context.SaveChangesAsync();
        }

        public async Task LockProjectBoqAsync(int projectId)
        {
            var projectExists = await _context.Projects
                .AnyAsync(project => project.Id == projectId);

            if (!projectExists)
            {
                throw new NotFoundException($"Project with id {projectId} was not found.");
            }


            var boqItems = await _context.BOQItems
                .Where(item => item.ProjectId == projectId)
                .ToListAsync();

            if (boqItems.Count == 0)
            {
                throw new BusinessRuleException("Cannot lock BOQ because it has no items.");
            }


            if (boqItems.All(item => item.IsLocked))
            {
                throw new BusinessRuleException("BOQ is already locked.");
            }


            await _context.BOQItems
                .Where(item => item.ProjectId == projectId)
                .ExecuteUpdateAsync(setters => setters.SetProperty(item => item.IsLocked, true));
        }


        private static void NormalizeBoqItem(CreateBOQItemRequestDto dto)
        {
            dto.ItemNumber = dto.ItemNumber.Trim();
            dto.ItemName = dto.ItemName.Trim();
            dto.Unit = dto.Unit.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Notes))
            {
                dto.Notes = dto.Notes.Trim();
            }
        }

        private static void NormalizeBoqItem(UpdateBOQItemRequestDto dto)
        {
            dto.ItemNumber = dto.ItemNumber.Trim();
            dto.ItemName = dto.ItemName.Trim();
            dto.Unit = dto.Unit.Trim();

            if (!string.IsNullOrWhiteSpace(dto.Notes))
            {
                dto.Notes = dto.Notes.Trim();
            }
        }

        private static string GetSortableItemNumber(string itemNumber)
        {
            return string.Join(".",
                itemNumber
                    .Split('.')
                    .Select(part => int.Parse(part).ToString("D5")));
        }
    }
}
