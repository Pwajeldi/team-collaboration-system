using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.Services
{
    public interface IFileService
    {
        Task DeleteAttachment(string userId, long fileId);
    }
    public class FileService : IFileService
    {
        private readonly TeamDbContext _context;
        private readonly IFileStorageService _storageService;

        public FileService(TeamDbContext context, CloudflareR2StorageService storageService)
        {
            _context = context;
            _storageService = storageService;
        }

        public async Task DeleteAttachment(string userId, long fileId)
        {
            var attachment = await _context.MessageAttachments
                .Include(a => a.Message)
                .FirstOrDefaultAsync(a => a.Id == fileId) 
                ?? throw new KeyNotFoundException("File does not exist");

            if (attachment.Message!.SenderId != userId)
                throw new UnauthorizedAccessException("You do not own this file");

            await _storageService.DeleteAsync(attachment.BlobName);
            _context.MessageAttachments.Remove(attachment);
            await _context.SaveChangesAsync();
        }
    }
}
