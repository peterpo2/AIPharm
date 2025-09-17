using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Core.Services
{
    public class AssistantService : IAssistantService
    {
        private readonly IRepository<Domain.Entities.Product> _productRepository;

        public AssistantService(IRepository<Domain.Entities.Product> productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<AssistantResponseDto> AskQuestionAsync(AssistantRequestDto request)
        {
            // Simulate AI processing delay
            await Task.Delay(1000 + new Random().Next(2000));

            var response = new AssistantResponseDto
            {
                Question = request.Question,
                ProductId = request.ProductId,
                Timestamp = DateTime.UtcNow,
                Disclaimer = "⚠️ Това е обща информация. Консултирайте се с лекар."
            };

            // Generate contextual response based on question content
            var question = request.Question.ToLower();

            if (question.Contains("парацетамол"))
            {
                response.Answer = "Парацетамолът е безопасно и ефективно обезболяващо средство. Препоръчваната доза за възрастни е 500-1000мг на 4-6 часа, максимум 4г дневно. Не трябва да се комбинира с алкохол и други лекарства съдържащи парацетамол.";
            }
            else if (question.Contains("ибупрофен"))
            {
                response.Answer = "Ибупрофенът е нестероидно противовъзпалително средство (НПВС). Препоръчва се прием с храна за предпазване на стомаха. Не се препоръчва при язва, бъбречни проблеми или алергия към НПВС.";
            }
            else if (question.Contains("витамин"))
            {
                response.Answer = "Витамините са важни за поддържане на здравето. Препоръчвам да се приемат според указанията на опаковката. При балансирано хранене, допълнителният прием може да не е необходим.";
            }
            else if (question.Contains("дозировка") || question.Contains("доза"))
            {
                response.Answer = "Дозировката зависи от конкретното лекарство, възрастта и теглото на пациента. Винаги следвайте указанията на опаковката или съветите на лекаря. При съмнения се консултирайте с фармацевт.";
            }
            else if (question.Contains("странични ефекти"))
            {
                response.Answer = "Всяко лекарство може да има странични ефекти. Най-честите са описани в листовката. При появата на необичайни симптоми спрете приема и се консултирайте с лекар.";
            }
            else
            {
                var responses = new[]
                {
                    "Според медицинската информация, която разполагам, този продукт се използва безопасно при спазване на указанията за дозиране.",
                    "Базирано на активните съставки, мога да кажа, че препоръчвам да се консултирате с лекар или фармацевт преди употреба.",
                    "От фармакологична гледна точка, важно е да прочетете внимателно листовката в опаковката.",
                    "Според клиничните данни, може да има взаимодействия с други лекарства, които приемате."
                };

                response.Answer = responses[new Random().Next(responses.Length)] + " Винаги се консултирайте с медицински специалист за персонализиран съвет.";
            }

            return response;
        }

        public async Task<IEnumerable<AssistantResponseDto>> GetConversationHistoryAsync(string userId)
        {
            // In a real implementation, this would fetch from a database
            // For now, return empty list
            await Task.CompletedTask;
            return new List<AssistantResponseDto>();
        }
    }
}