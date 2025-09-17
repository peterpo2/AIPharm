using Microsoft.AspNetCore.Mvc;
using AIPharm.Core.DTOs;
using AIPharm.Core.Interfaces;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly IAssistantService _assistantService;

        public AssistantController(IAssistantService assistantService)
        {
            _assistantService = assistantService;
        }

        [HttpPost("ask")]
        public async Task<ActionResult<AssistantResponseDto>> AskQuestion([FromBody] AssistantRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                {
                    return BadRequest(new { message = "Question is required" });
                }

                var response = await _assistantService.AskQuestionAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while processing your question", error = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<AssistantResponseDto>>> GetConversationHistory()
        {
            try
            {
                // In a real application, this would get the user ID from the JWT token
                var userId = Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
                var history = await _assistantService.GetConversationHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching conversation history", error = ex.Message });
            }
        }
    }
}