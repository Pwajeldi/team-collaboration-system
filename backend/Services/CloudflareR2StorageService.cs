using Amazon.S3;
using Amazon.S3.Model;

namespace backend.Services
{
    public interface IFileStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
        Task<Stream> DownloadAsync(string key);
        Task DeleteAsync(string key);
    }
    public class CloudflareR2StorageService : IFileStorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;

        public CloudflareR2StorageService(IAmazonS3 s3Client, IConfiguration config)
        {
            _s3Client = s3Client;
            _bucketName = config["CloudflareR2:BucketName"]
                ?? throw new InvalidOperationException("CloudflareR2:BucketName is not configured.");
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
        {
            var key = $"{Guid.NewGuid()}-{fileName}";

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                DisablePayloadSigning = true
            };

            await _s3Client.PutObjectAsync(request);
            return key;
        }

        public async Task<Stream> DownloadAsync(string key)
        {
            var response = await _s3Client.GetObjectAsync(_bucketName, key);
            return response.ResponseStream;
        }

        public async Task DeleteAsync(string key)
        {
            await _s3Client.DeleteObjectAsync(_bucketName, key);
        }
    }
}
