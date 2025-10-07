using System;

namespace AIPharm.Core.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = string.Empty;
        public int ProductCount { get; set; }
    }

    public class CreateCategoryDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Icon { get; set; } = string.Empty;
    }

    public class UpdateCategoryDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Icon { get; set; }
    }
}