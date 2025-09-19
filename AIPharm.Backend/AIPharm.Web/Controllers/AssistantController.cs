using Microsoft.AspNetCore.Authorization;
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

        /// <summary>
        /// Ask the AI assistant a question (product-aware).
        /// </summary>
        [HttpPost("ask")]
        [AllowAnonymous] // or [Authorize] if you want only logged users
        public async Task<ActionResult<AssistantResponseDto>> AskQuestion([FromBody] AssistantRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Question))
                {
                    return BadRequest(new { message = "❌ Question is required" });
                }

                var userId = GetUserId();
                var response = await _assistantService.AskQuestionAsync(request);

                // Optional: persist the Q&A in DB for this user
                // await _assistantService.SaveConversationAsync(userId, response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ An error occurred while processing your question",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get conversation history for the current user.
        /// </summary>
        [HttpGet("history")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<AssistantResponseDto>>> GetConversationHistory()
        {
            try
            {
                var userId = GetUserId();
                var history = await _assistantService.GetConversationHistoryAsync(userId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ An error occurred while fetching conversation history",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Clear conversation history (for demo, resets memory).
        /// </summary>
        [HttpDelete("history")]
        [AllowAnonymous]
        public async Task<IActionResult> ClearHistory()
        {
            try
            {
                var userId = GetUserId();
                await _assistantService.ClearConversationHistoryAsync(userId);
                return Ok(new { message = "✅ Conversation history cleared" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "❌ Failed to clear history",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Helper: get user ID (from JWT if available, fallback to header or demo).
        /// </summary>
        private string GetUserId()
        {
            // If JWT auth is configured → use it
            if (User?.Identity?.IsAuthenticated == true)
            {
                var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                if (!string.IsNullOrEmpty(userId))
                    return userId;
            }

            // Else, fallback
            return Request.Headers["X-User-Id"].FirstOrDefault() ?? "demo-user";
        }
    }
}
