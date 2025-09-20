using System.Collections.Concurrent;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;

namespace AIPharm.Core.Services
{
    public class AssistantService : IAssistantService
    {
        private readonly IRepository<Product> _productRepository;
        private readonly ILogger<AssistantService> _logger;
        private readonly ChatClient? _chatClient;
        private readonly bool _assistantEnabled;
        private const string ModelName = "gpt-4o-mini";
        private static readonly ConcurrentDictionary<string, List<AssistantResponseDto>> _conversations = new();

        public AssistantService(
            IRepository<Product> productRepository,
            IConfiguration config,
            ILogger<AssistantService> logger)
        {
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            var apiKey = config["OpenAI:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                _logger.LogWarning("OpenAI API key is missing. Assistant responses will be disabled.");
                _assistantEnabled = false;
                return;
            }

            try
            {
                _chatClient = new ChatClient(ModelName, apiKey);
                _assistantEnabled = true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initialise OpenAI chat client. Assistant responses will be disabled.");
                _assistantEnabled = false;
            }
        }

        public async Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request)
        {
            var response = new AssistantResponseDto
            {
                Question = request.Question,
                ProductId = request.ProductId,
                Timestamp = DateTime.UtcNow,
                Disclaimer = "⚠️ Това е обща информация. Консултирайте се с лекар."
            };

            if (!_assistantEnabled || _chatClient is null)
            {
                response.Answer = "⚠️ AI assistant is currently disabled because the OpenAI API key is not configured.";
                _logger.LogWarning("Assistant question skipped because the service is disabled. Question={Question}", request.Question);
                return response;
            }

            string productContext = string.Empty;
            if (request.ProductId.HasValue)
            {
                var product = await _productRepository.FirstOrDefaultAsync(p => p.Id == request.ProductId.Value);
                if (product != null)
                {
                    productContext =
                        $"- Name: {product.Name} / {product.NameEn}\n" +
                        $"- Active ingredient: {product.ActiveIngredient}\n" +
                        $"- Dosage: {product.Dosage}\n" +
                        $"- Manufacturer: {product.Manufacturer}\n";
                }
                else
                {
                    _logger.LogInformation("Requested product context not found for ProductId={ProductId}", request.ProductId);
                }
            }

            var prompt =
                "You are an AI medical assistant for a pharmacy app. " +
                "Answer in Bulgarian if the user asked in Bulgarian, otherwise in English. " +
                "Always be concise, safe, and clear.\n\n" +
                $"User question: {request.Question}\n{productContext}\n\n" +
                "Also suggest (if relevant): dosage, side effects, alternatives.\n" +
                "Always include a disclaimer at the end.";

            try
            {
                var chatResponse = await _chatClient.CompleteChatAsync(new List<ChatMessage>
                {
                    new UserChatMessage(prompt)
                });

                var completion = chatResponse.Value;

                response.Answer = string.Join(
                    "\n",
                    completion.Content
                        .Select(c => c.Text)
                        .Where(t => !string.IsNullOrWhiteSpace(t))
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OpenAI chat request failed.");
                response.Answer = $"⚠️ Error: AI service unavailable. ({ex.Message})";
            }

            return response;
        }

        public async Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId)
        {
            await Task.CompletedTask;
            return _conversations.TryGetValue(userId, out var history)
                ? history
                : Enumerable.Empty<AssistantResponseDto>();
        }

        public async Task SaveConversationAsync(string userId, AssistantResponseDto response)
        {
            var history = _conversations.GetOrAdd(userId, _ => new List<AssistantResponseDto>());
            lock (history) history.Add(response);
            await Task.CompletedTask;
        }

        public async Task ClearConversationHistoryAsync(string userId)
        {
            _conversations.TryRemove(userId, out _);
            await Task.CompletedTask;
        }
    }
}
