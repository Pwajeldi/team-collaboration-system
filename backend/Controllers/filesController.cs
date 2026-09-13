using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class filesController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;
        private readonly TeamDbContext _context;
        private static readonly HashSet<string> allowedTypes = [
            "image/png", "image/jpeg", "image/gif", "application/pdf","application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        public filesController(IFileStorageService fileStorageService, TeamDbContext context)
        {
            _fileStorageService = fileStorageService;
            _context = context;
        }

        [HttpPost("attachments/upload")]
        [RequestSizeLimit(50 * 1024 * 1024)]
        public async Task<IActionResult> UploadAttachment(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest("No file provided.");

            if (string.IsNullOrWhiteSpace(file.FileName))
                return BadRequest("File must have a name.");

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("File type not supported.");

            using var stream = file.OpenReadStream();
            var blobName = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType);

            var attachment = new MessageAttachment
            {
                MessageId = null,
                BlobName = blobName,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
            };

            _context.MessageAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = attachment.Id,
                blobName = attachment.BlobName,
                fileName = attachment.FileName,
                contentType = attachment.ContentType,
                fileSizeBytes = attachment.FileSizeBytes,
            });
        }

        [HttpPost("/groupattachment/upload")]
        [RequestSizeLimit(50 * 1024 * 1024)]
        public async Task<IActionResult> UploadGroupChatAttatchment(IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest("No file provided.");

            if (string.IsNullOrWhiteSpace(file.FileName))
                return BadRequest("File must have a name.");

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("File type not supported.");

            using var stream = file.OpenReadStream();
            var blobName = await _fileStorageService.UploadAsync(stream, file.FileName, file.ContentType);

            var attachment = new MessageAttachment
            {
                MessageId = null,
                BlobName = blobName,
                FileName = file.FileName,
                ContentType = file.ContentType,
                FileSizeBytes = file.Length,
            };

            _context.MessageAttachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = attachment.Id,
                blobName = attachment.BlobName,
                fileName = attachment.FileName,
                contentType = attachment.ContentType,
                fileSizeBytes = attachment.FileSizeBytes,
            });
        }

        [HttpGet("attachments/download/{blobName}")]
        public async Task<IActionResult> DownloadAttachment(string blobName)
        {
            var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId is null) return Unauthorized("No available user");

            var attachment = await _context.MessageAttachments
                .Include(at => at.Message)
                .FirstOrDefaultAsync(at => at.BlobName == blobName);

            if(attachment is null) return NotFound();

            var isParticipant = attachment.Message!.RecipientId == callerId || attachment.Message.SenderId == callerId;
            if (!isParticipant) return Forbid();

            var stream = await _fileStorageService.DownloadAsync(blobName);
            return File(stream, attachment.ContentType, attachment.FileName);
        }

        [HttpDelete("attachments/{id}")]
        public async Task<IActionResult> DeleteAttachment(long id)
        {
            var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (callerId is null) return Unauthorized();

            var attachment = await _context.MessageAttachments
                .Include(a => a.Message)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attachment is null) return NotFound();

            if (attachment.Message!.SenderId != callerId)
                return Forbid();

            await _fileStorageService.DeleteAsync(attachment.BlobName);
            _context.MessageAttachments.Remove(attachment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
