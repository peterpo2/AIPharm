using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIPharm.Core.Services
{
    public class OrderService : IOrderService
    {
        private const decimal FreeDeliveryThreshold = 25m;
        private const decimal StandardDeliveryFee = 4.99m;

        private readonly IRepository<Order> _orderRepository;
        private readonly IRepository<Product> _productRepository;
        private readonly IRepository<User> _userRepository;

        public OrderService(
            IRepository<Order> orderRepository,
            IRepository<Product> productRepository,
            IRepository<User> userRepository)
        {
            _orderRepository = orderRepository;
            _productRepository = productRepository;
            _userRepository = userRepository;
        }

        public async Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto orderDto)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(userId);
            ArgumentNullException.ThrowIfNull(orderDto);

            if (orderDto.Items == null || orderDto.Items.Count == 0)
            {
                throw new InvalidOperationException("Cannot create an order without any items.");
            }

            var user = await _userRepository.GetByIdAsync(userId)
                       ?? throw new ArgumentException("User not found.", nameof(userId));

            var orderItems = new List<OrderItem>();
            decimal subtotal = 0m;

            foreach (var item in orderDto.Items)
            {
                if (item.Quantity <= 0)
                {
                    throw new ArgumentException("Item quantity must be at least 1.");
                }

                var product = await _productRepository.GetByIdAsync(item.ProductId)
                              ?? throw new ArgumentException($"Product with ID {item.ProductId} was not found.");

                var unitPrice = product.Price;
                subtotal += unitPrice * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    ProductName = product.Name,
                    ProductDescription = product.Description,
                });
            }

            var deliveryFee = subtotal >= FreeDeliveryThreshold ? 0m : StandardDeliveryFee;

            var order = new Order
            {
                UserId = userId,
                User = user,
                OrderNumber = GenerateOrderNumber(),
                Status = OrderStatus.Pending,
                PaymentMethod = orderDto.PaymentMethod,
                Total = decimal.Round(subtotal, 2, MidpointRounding.AwayFromZero),
                DeliveryFee = deliveryFee,
                DeliveryAddress = Normalize(orderDto.DeliveryAddress),
                City = Normalize(orderDto.City),
                PostalCode = Normalize(orderDto.PostalCode),
                Country = Normalize(orderDto.Country),
                CustomerName = Normalize(orderDto.CustomerName) ?? user.FullName,
                CustomerEmail = Normalize(orderDto.CustomerEmail) ?? user.Email,
                PhoneNumber = Normalize(orderDto.PhoneNumber) ?? user.PhoneNumber,
                Notes = Normalize(orderDto.Notes),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Items = orderItems
            };

            await _orderRepository.AddAsync(order);

            var createdOrder = await _orderRepository.Query()
                .Where(o => o.Id == order.Id)
                .Include(o => o.Items)
                .Include(o => o.User)
                .FirstAsync();

            return MapOrder(createdOrder);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersForUserAsync(string userId)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(userId);

            var orders = await _orderRepository.Query()
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrder).ToList();
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.Query()
                .Include(o => o.Items)
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return orders.Select(MapOrder).ToList();
        }

        private static string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var randomSuffix = Random.Shared.Next(1000, 9999);
            return $"ORD-{timestamp}-{randomSuffix}";
        }

        private static string? Normalize(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            return value.Trim();
        }

        private static OrderDto MapOrder(Order order)
        {
            return new OrderDto
            {
                Id = order.Id,
                OrderNumber = order.OrderNumber,
                Status = order.Status,
                PaymentMethod = order.PaymentMethod,
                Total = order.Total,
                DeliveryFee = order.DeliveryFee,
                CustomerName = order.CustomerName ?? order.User?.FullName,
                CustomerEmail = order.CustomerEmail ?? order.User?.Email,
                PhoneNumber = order.PhoneNumber ?? order.User?.PhoneNumber,
                DeliveryAddress = order.DeliveryAddress,
                City = order.City,
                PostalCode = order.PostalCode,
                Country = order.Country,
                Notes = order.Notes,
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt,
                UserId = order.UserId,
                UserEmail = order.User?.Email,
                UserFullName = order.User?.FullName,
                Items = order.Items
                    .OrderBy(i => i.Id)
                    .Select(i => new OrderItemDto
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = i.ProductName,
                        ProductDescription = i.ProductDescription,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = decimal.Round(i.UnitPrice * i.Quantity, 2, MidpointRounding.AwayFromZero)
                    })
                    .ToList()
            };
        }
    }
}
