using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System;

namespace AIPharm.Domain.Entities
{
    public class AssistantMessage
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public bool IsUser { get; set; }

        public Guid? ProductId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public Product? Product { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
