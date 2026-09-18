using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;


namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class taskController : ControllerBase
    {
        private readonly UserManager<TeamMember> _userManager;
        private readonly ITaskService _taskService;
        public taskController(UserManager<TeamMember> userManager, ITaskService taskService)
        {
            _userManager = userManager;
            _taskService = taskService;
        }

        [Authorize(Roles = "manager,admin")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateTask(CreateTaskDto dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if(currentUser is null) return Unauthorized();
            try
            {
                var newTask = await _taskService.CreateTask(dto, currentUser);
                return CreatedAtAction(nameof(GetTask), new { id = newTask.Id }, MapToResponse(newTask));
            }
            catch(ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetTaskSummary()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null) return Unauthorized();
            try
            {
                var taskSummary = await _taskService.GetTaskSummary(user);
                return Ok(taskSummary);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks([FromQuery] TaskQueryParameters query)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if(currentUser is null) return Unauthorized();
            try
            {
                var tasks = await _taskService.GetTasks(query, currentUser);
                return Ok(tasks.Select(MapToResponse));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("tasks/{id}")]
        public async Task<IActionResult> GetTask(Guid id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if(currentUser is null) return Unauthorized();
            try
            {
                var task = await _taskService.GetTask(id, currentUser);
                return Ok(MapToResponse(task));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return Unauthorized(ex.Message);
            }
        }

        [Authorize(Roles = "manager,admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, UpdateTaskDto dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if(currentUser is null) return Unauthorized();
            try
            {
                var updatedTask = await _taskService.UpdateTask(id, dto, currentUser);
                return Ok(MapToResponse(updatedTask));
            }
            catch(ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPatch("status/{id}")]
        public async Task<IActionResult> UpdateTaskStatus(Guid id, [FromBody]UpdateTaskStatusDto dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if(currentUser is null) return Unauthorized("User does not exist");
            try
            {
                await _taskService.UpdateTaskStatus(id, dto, currentUser);
                return Ok();
            }
            catch(KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [Authorize(Roles = "manager,admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null) return Unauthorized();
            try
            {
                await _taskService.DeleteTask(id, currentUser);
                return NoContent();
            }
            catch(KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "manager,admin")]
        [HttpGet("team/assignable")]
        public async Task<IActionResult> GetAssignableMembers()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser is null) return Unauthorized();
            try
            {
                var assignable = await _taskService.GetAssignableMembers(currentUser);
                return Ok(assignable);
            }
            catch(ArgumentNullException ex)
            {
                return BadRequest(ex.Message);
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("progress/{taskId}/{progress}")]
        public async Task<IActionResult> UpdateTaskProgress(Guid taskId, int progress)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized("Failed to locate user");
            try
            {
                await _taskService.UpdateTaskProgress(userId, taskId, progress);
                return Ok("Progress successfully modified");
            }
            catch(ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception)
            {
                return StatusCode(500,"An error occured");
            }
        }

        private static TaskResponse MapToResponse(TaskItem task)
        {
            return new TaskResponse
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                Status = task.Status,
                Priority = task.Priority,
                Progress = task.Progress,
                DueDate = task.DueDate,
                CreatedAt = task.CreatedAt,
                CompletedAt = task.CompletedAt,
                AssignedById = task.AssignedById,
                AssignedByName = $"{task.AssignedBy?.FirstName} {task.AssignedBy?.LastName}".Trim(),
                AssignedToId = task.AssignedToId,
                AssignedToName = $"{task.AssignedTo?.FirstName} {task.AssignedTo?.LastName}".Trim(),
            };
        }

    }
}
