using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AIPharm.Domain.Entities
{
    public enum OrderStatus
    {
        Pending = 0,
        Confirmed = 1,
        Processing = 2,
        Shipped = 3,
        Delivered = 4,
        Cancelled = 5
    }

    public enum PaymentMethod
    {
        CashOnDelivery = 0,
        Card = 1,
        BankTransfer = 2
    }

    public class Order
    {
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string OrderNumber { get; set; } = string.Empty;
        
        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.CashOnDelivery;

        [Column(TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }

        [Column(TypeName = "decimal(10,2)")]
        public decimal DeliveryFee { get; set; } = 0;

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(150)]
        public string? CustomerName { get; set; }

        [MaxLength(100)]
        [EmailAddress]
        public string? CustomerEmail { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}