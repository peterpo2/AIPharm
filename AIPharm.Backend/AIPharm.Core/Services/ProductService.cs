using System.Collections.Concurrent;
using System.Globalization;
using System.Linq;
using AutoMapper;
using Microsoft.Extensions.Caching.Memory;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.Services
{
    public class ProductService : IProductService
    {
        private const string CacheKeySeparator = "|";
        private const string ProductListCachePrefix = "products:list";
        private const string ProductCachePrefix = "products:item";
        private const string ProductSearchCachePrefix = "products:search";

        private static readonly ConcurrentDictionary<string, byte> _trackedCacheKeys = new();

        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<Category> _categoryRepository;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _memoryCache;

        public ProductService(
            IRepository<Product> productRepository,
            IRepository<Category> categoryRepository,
            IMapper mapper,
            IMemoryCache memoryCache)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
            _memoryCache = memoryCache;
        }

        public async Task<PagedResultDto<ProductDto>> GetProductsAsync(ProductFilterDto filter)
        {
            var cacheKey = BuildProductListCacheKey(filter);
            if (_memoryCache.TryGetValue(cacheKey, out PagedResultDto<ProductDto>? cachedResult))
            {
                return cachedResult;
            }

            var query = await _productRepository.GetAllAsync();
            var products = query.AsQueryable();

            // Apply filters
            if (filter.CategoryId.HasValue)
            {
                products = products.Where(p => p.CategoryId == filter.CategoryId.Value);
            }

            if (filter.MinPrice.HasValue)
            {
                products = products.Where(p => p.Price >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                products = products.Where(p => p.Price <= filter.MaxPrice.Value);
            }

            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                products = products.Where(p =>
                    p.Name.ToLower().Contains(searchTerm) ||
                    (p.Description != null && p.Description.ToLower().Contains(searchTerm)) ||
                    (p.ActiveIngredient != null && p.ActiveIngredient.ToLower().Contains(searchTerm)));
            }

            if (filter.RequiresPrescription.HasValue)
            {
                products = products.Where(p => p.RequiresPrescription == filter.RequiresPrescription.Value);
            }

            var totalCount = products.Count();
            var pagedProducts = products
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToList();

            var productDtos = _mapper.Map<List<ProductDto>>(pagedProducts);

            // Add category names
            var categoryIds = productDtos.Select(p => p.CategoryId).Distinct();
            var categories = await _categoryRepository.FindAsync(c => categoryIds.Contains(c.Id));
            var categoryDict = categories.ToDictionary(c => c.Id, c => c.Name);

            foreach (var product in productDtos)
            {
                product.CategoryName = categoryDict.GetValueOrDefault(product.CategoryId);
            }

            var result = new PagedResultDto<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize
            };

            _memoryCache.Set(cacheKey, result, CreateCacheEntryOptions());
            TrackCacheKey(cacheKey);

            return result;
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var cacheKey = BuildProductCacheKey(id);
            if (_memoryCache.TryGetValue(cacheKey, out ProductDto? cachedProduct))
            {
                return cachedProduct;
            }

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null) return null;

            var productDto = _mapper.Map<ProductDto>(product);

            var category = await _categoryRepository.GetByIdAsync(product.CategoryId);
            productDto.CategoryName = category?.Name;

            _memoryCache.Set(cacheKey, productDto, CreateCacheEntryOptions());
            TrackCacheKey(cacheKey);

            return productDto;
        }

        public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return Enumerable.Empty<ProductDto>();
            }

            var cacheKey = BuildSearchCacheKey(searchTerm);
            if (_memoryCache.TryGetValue(cacheKey, out IEnumerable<ProductDto>? cachedResults))
            {
                return cachedResults;
            }

            var normalizedSearch = searchTerm.Trim();
            var products = await _productRepository.FindAsync(p =>
                p.Name.Contains(normalizedSearch) ||
                (p.Description != null && p.Description.Contains(normalizedSearch)) ||
                (p.ActiveIngredient != null && p.ActiveIngredient.Contains(normalizedSearch)));

            var mappedProducts = _mapper.Map<List<ProductDto>>(products);

            _memoryCache.Set(cacheKey, mappedProducts, CreateCacheEntryOptions());
            TrackCacheKey(cacheKey);

            return mappedProducts;
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
        {
            var category = await _categoryRepository.GetByIdAsync(createProductDto.CategoryId);
            if (category == null)
            {
                throw new ArgumentException($"Category with ID {createProductDto.CategoryId} not found");
            }

            var product = _mapper.Map<Product>(createProductDto);
            product.CreatedAt = DateTime.UtcNow;
            product.UpdatedAt = DateTime.UtcNow;

            var createdProduct = await _productRepository.AddAsync(product);
            var productDto = _mapper.Map<ProductDto>(createdProduct);
            var createdCategory = await _categoryRepository.GetByIdAsync(productDto.CategoryId);
            productDto.CategoryName = createdCategory?.Name;

            // The newly created product may affect list/search caches.
            InvalidateCollectionCaches();
            CacheProduct(productDto);

            return productDto;
        }

        public async Task<ProductDto> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
        {
            ArgumentNullException.ThrowIfNull(updateProductDto);

            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            if (updateProductDto.CategoryId.HasValue)
            {
                var category = await _categoryRepository.GetByIdAsync(updateProductDto.CategoryId.Value);
                if (category == null)
                {
                    throw new ArgumentException($"Category with ID {updateProductDto.CategoryId.Value} not found");
                }
            }

            _mapper.Map(updateProductDto, product);
            product.UpdatedAt = DateTime.UtcNow;

            var updatedProduct = await _productRepository.UpdateAsync(product);
            var productDto = _mapper.Map<ProductDto>(updatedProduct);
            var category = await _categoryRepository.GetByIdAsync(productDto.CategoryId);
            productDto.CategoryName = category?.Name;

            InvalidateCollectionCaches();
            InvalidateProductCache(id);
            CacheProduct(productDto);

            return productDto;
        }

        public async Task DeleteProductAsync(int id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                throw new KeyNotFoundException($"Product with ID {id} not found");

            product.IsDeleted = true;
            product.UpdatedAt = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);

            InvalidateCollectionCaches();
            InvalidateProductCache(id);
        }

        private void CacheProduct(ProductDto productDto)
        {
            var cacheKey = BuildProductCacheKey(productDto.Id);
            _memoryCache.Set(cacheKey, productDto, CreateCacheEntryOptions());
            TrackCacheKey(cacheKey);
        }

        private static string BuildProductListCacheKey(ProductFilterDto filter)
        {
            return string.Join(CacheKeySeparator,
                ProductListCachePrefix,
                filter.PageNumber,
                filter.PageSize,
                filter.CategoryId?.ToString(CultureInfo.InvariantCulture) ?? "null",
                filter.MinPrice?.ToString(CultureInfo.InvariantCulture) ?? "null",
                filter.MaxPrice?.ToString(CultureInfo.InvariantCulture) ?? "null",
                string.IsNullOrWhiteSpace(filter.SearchTerm)
                    ? "null"
                    : filter.SearchTerm.Trim().ToLowerInvariant(),
                filter.RequiresPrescription.HasValue ? filter.RequiresPrescription.Value.ToString() : "null");
        }

        private static string BuildProductCacheKey(int id) => string.Join(CacheKeySeparator, ProductCachePrefix, id);

        private static string BuildSearchCacheKey(string searchTerm) =>
            string.Join(CacheKeySeparator, ProductSearchCachePrefix, searchTerm.Trim().ToLowerInvariant());

        private MemoryCacheEntryOptions CreateCacheEntryOptions() => new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(3),
            SlidingExpiration = TimeSpan.FromMinutes(1)
        };

        private void TrackCacheKey(string key)
        {
            _trackedCacheKeys.TryAdd(key, 0);
        }

        private void InvalidateCollectionCaches()
        {
            RemoveCacheByPrefix(ProductListCachePrefix);
            RemoveCacheByPrefix(ProductSearchCachePrefix);
        }

        private void InvalidateProductCache(int productId)
        {
            var key = BuildProductCacheKey(productId);
            _memoryCache.Remove(key);
            _trackedCacheKeys.TryRemove(key, out _);
        }

        private void RemoveCacheByPrefix(string prefix)
        {
            var keysToRemove = _trackedCacheKeys.Keys
                .Where(k => k.StartsWith(prefix, StringComparison.Ordinal))
                .ToList();

            foreach (var key in keysToRemove)
            {
                _memoryCache.Remove(key);
                _trackedCacheKeys.TryRemove(key, out _);
            }
        }

        private static void ValidateCreateProductInput(CreateProductDto createProductDto)
        {
            if (string.IsNullOrWhiteSpace(createProductDto.Name))
            {
                throw new ArgumentException("Product name is required.", nameof(CreateProductDto.Name));
            }

            if (createProductDto.Price <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.Price), "Price must be greater than zero.");
            }

            if (createProductDto.StockQuantity < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.StockQuantity), "Stock quantity cannot be negative.");
            }

            if (createProductDto.CategoryId <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(CreateProductDto.CategoryId), "CategoryId must be greater than zero.");
            }
        }

        private static void ValidateUpdateProductInput(UpdateProductDto updateProductDto)
        {
            if (updateProductDto.Name != null && string.IsNullOrWhiteSpace(updateProductDto.Name))
            {
                throw new ArgumentException("Product name cannot be empty when provided.", nameof(UpdateProductDto.Name));
            }

            if (updateProductDto.Price.HasValue && updateProductDto.Price.Value <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.Price), "Price must be greater than zero.");
            }

            if (updateProductDto.StockQuantity.HasValue && updateProductDto.StockQuantity.Value < 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.StockQuantity), "Stock quantity cannot be negative.");
            }

            if (updateProductDto.CategoryId.HasValue && updateProductDto.CategoryId.Value <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(UpdateProductDto.CategoryId), "CategoryId must be greater than zero.");
            }
        }
    }
}
