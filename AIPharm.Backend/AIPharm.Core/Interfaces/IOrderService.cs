using System.Collections.Generic;
using System.Threading.Tasks;
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CreateOrderAsync(string userId, CreateOrderDto orderDto);
        Task<IEnumerable<OrderDto>> GetOrdersForUserAsync(string userId);
        Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    }
}
