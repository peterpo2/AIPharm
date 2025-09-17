namespace AIPharm.Core.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public bool RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
        public decimal? Rating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class CreateProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }
        public bool RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
    }

    public class UpdateProductDto
    {
        public string? Name { get; set; }
        public string? NameEn { get; set; }
        public string? Description { get; set; }
        public string? DescriptionEn { get; set; }
        public decimal? Price { get; set; }
        public int? StockQuantity { get; set; }
        public string? ImageUrl { get; set; }
        public int? CategoryId { get; set; }
        public bool? RequiresPrescription { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ActiveIngredientEn { get; set; }
        public string? Dosage { get; set; }
        public string? DosageEn { get; set; }
        public string? Manufacturer { get; set; }
        public string? ManufacturerEn { get; set; }
    }

    public class ProductFilterDto
    {
        public int? CategoryId { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? SearchTerm { get; set; }
        public bool? RequiresPrescription { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}