using System;
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(Guid id);
        Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto createCategoryDto);
        Task<CategoryDto> UpdateCategoryAsync(Guid id, UpdateCategoryDto updateCategoryDto);
        Task DeleteCategoryAsync(Guid id);
    }
}