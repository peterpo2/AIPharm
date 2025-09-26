using System;
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IProductService
    {
        Task<PagedResultDto<ProductDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDto?> GetProductByIdAsync(Guid id);
        Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
        Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
        Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductDto updateProductDto);
        Task DeleteProductAsync(Guid id);
    }
}