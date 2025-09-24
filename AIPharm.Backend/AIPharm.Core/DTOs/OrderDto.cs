using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using AIPharm.Domain.Entities;

namespace AIPharm.Core.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public OrderStatus Status { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public decimal Total { get; set; }
        public decimal DeliveryFee { get; set; }
        public decimal GrandTotal => Total + DeliveryFee;
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? PhoneNumber { get; set; }
        public string? DeliveryAddress { get; set; }
        public string? City { get; set; }
        public string? PostalCode { get; set; }
        public string? Country { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? UserEmail { get; set; }
        public string? UserFullName { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductDescription { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CreateOrderItemDto
    {
        [Range(1, int.MaxValue)]
        public int ProductId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CreateOrderDto
    {
        [Required]
        [MinLength(1)]
        public List<CreateOrderItemDto> Items { get; set; } = new();

        [MaxLength(150)]
        public string? CustomerName { get; set; }

        [EmailAddress]
        [MaxLength(100)]
        public string? CustomerEmail { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        [MaxLength(500)]
        public string? DeliveryAddress { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(20)]
        public string? PostalCode { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }

    public class UpdateOrderStatusDto
    {
        [Required]
        public OrderStatus Status { get; set; }
    }
}
