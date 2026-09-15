using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class profileController : ControllerBase
    {
        private readonly IProfileService _profileService;
        private readonly TeamDbContext _context;
        private readonly IFileStorageService _storageService;

        public profileController(IProfileService profileService, IFileStorageService storageService, TeamDbContext context)
        {
            _profileService = profileService;
            _storageService = storageService;
            _context = context;
        }

        [HttpGet("myprofile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();
            try
            {
                var myProfile = await _profileService.GetMyProfile(userId);
                return Ok(myProfile);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeletetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();
            try
            {
                await _profileService.DeleteProfile(userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();
            try
            {
                var updatedProfile = await _profileService.UpdateMyProfile(userId, dto);
                return Ok(updatedProfile);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("password/update")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); if (userId is null) return Unauthorized();
            try
            {
                await _profileService.ChangePassword(userId, dto);
                return Ok("Check your email to verify request");
            }
            catch(ArgumentException ex)
            {
                return BadRequest(ex.Message);
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

        [HttpGet("mypicture")]
        public async Task<IActionResult> GetMyProfilePicture()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId is null) return Unauthorized();

            var userProfilePicture = await _context.UserProfilePictures
                .FirstOrDefaultAsync(p => p.UserId ==  userId);

            if (userProfilePicture is null) return BadRequest("Upload profile picture");

            var profilePictureStream = await _storageService.DownloadAsync(userProfilePicture.BlobName);
            return File(profilePictureStream, userProfilePicture.ContentType);
        }
    }
}
