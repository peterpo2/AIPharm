using System;
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(Guid userId);
        Task<CartDto> AddToCartAsync(Guid userId, AddToCartDto addToCartDto);
        Task<CartDto> UpdateCartItemAsync(Guid userId, Guid cartItemId, UpdateCartItemDto updateCartItemDto);
        Task<CartDto> RemoveFromCartAsync(Guid userId, Guid cartItemId);
        Task<CartDto> ClearCartAsync(Guid userId);
    }
}