using System;
using AIPharm.Core.DTOs;

namespace AIPharm.Core.Interfaces
{
    public interface IAssistantService
{
    Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request);
    Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(Guid userId);
    Task SaveConversationAsync(Guid userId, AssistantResponseDto response);
    Task ClearConversationHistoryAsync(Guid userId);
}

}