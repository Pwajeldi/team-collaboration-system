using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Identity;
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
        private readonly IFileService _fileService;
        private readonly UserManager<TeamMember> _userManager;
        private static readonly HashSet<string> allowedTypes = [
            "image/png", "image/jpeg", "image/gif", "application/pdf","application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        private static readonly HashSet<string> allowedPictureTypes = [
           "image/png", "image/jpeg", "image/gif",
        ];


        public filesController(IFileStorageService fileStorageService, UserManager<TeamMember> userManager, TeamDbContext context, IFileService fileService)
        {
            _fileStorageService = fileStorageService;
            _context = context;
            _fileService = fileService;
            _userManager = userManager;
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

        [HttpPost("groupfiles/upload")]
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
                DepartmentMessageId = null,
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
            try
            {
                await _fileService.DeleteAttachment(callerId, id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("profile/picture/upload")]
        [RequestSizeLimit(50 * 1024 * 1024)]
        public async Task<IActionResult> UploadProfilePicture(IFormFile picture)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized("Invalid user");

            var user = await _userManager.FindByIdAsync(userId);
            if (user is null) return Unauthorized();

            if (picture is null || picture.Length == 0)
                return BadRequest("No file provided.");

            if (string.IsNullOrWhiteSpace(picture.FileName))
                return BadRequest("File must have a name.");

            if (!allowedPictureTypes.Contains(picture.ContentType))
                return BadRequest("File type not supported.");

            var existingProfilePicture = await _context.UserProfilePictures
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if(existingProfilePicture is null)
            {
                using var stream = picture.OpenReadStream();
                var blobName = await _fileStorageService.UploadAsync(stream, picture.FileName, picture.ContentType);

                var profilePicture = new UserProfilePicture
                {
                    UserId = userId,
                    BlobName = blobName,
                    FileName = picture.FileName,
                    ContentType = picture.ContentType,
                    FileSizeBytes = picture.Length,
                };
                await _context.UserProfilePictures.AddAsync(profilePicture);
                await _context.SaveChangesAsync();

                var profile = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
                if (profile is not null)
                {
                    profile.ProfilePictureBlobName = profilePicture.BlobName;
                }
                user.ProfilePictureBlobName = profilePicture.BlobName;
                await _context.SaveChangesAsync();
                return Ok("Profile has been uploaded");
            }
            else
            {
                await _fileStorageService.DeleteAsync(existingProfilePicture.BlobName);
                using var stream = picture.OpenReadStream();
                var blobName = await _fileStorageService.UploadAsync(stream, picture.FileName, picture.ContentType);
                existingProfilePicture.BlobName = blobName;
                existingProfilePicture.FileName = picture.FileName;
                existingProfilePicture.ContentType = picture.ContentType;
                await _context.SaveChangesAsync();
                return Ok("Updated profile image");
            }
        }
    }
}
