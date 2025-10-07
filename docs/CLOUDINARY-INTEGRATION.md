# Cloudinary Integration for LEAD101

## Overview

LEAD101 now includes comprehensive Cloudinary integration for asset management, providing secure, scalable file storage with advanced image transformations and optimization features.

## Features

- **Secure File Upload**: Direct upload to Cloudinary with authentication
- **Image Optimization**: Automatic format conversion and quality optimization
- **Responsive Images**: Multiple size variants (thumbnail, small, medium, large)
- **File Management**: Upload, delete, list, and organize assets
- **Multi-tenant Support**: Tenant-isolated asset storage
- **Signed URLs**: Direct client uploads with secure signatures
- **Asset Metadata**: Comprehensive tracking and organization

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# File Upload Configuration
MAX_FILE_SIZE=10485760 # 10MB in bytes
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,application/x-rar-compressed"
```

### Cloudinary Setup

1. **Create Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
2. **Get Credentials**: Copy your Cloud Name, API Key, and API Secret from the dashboard
3. **Configure Environment**: Add credentials to your `.env` file
4. **Set Upload Presets** (Optional): Configure upload presets in Cloudinary dashboard for additional security

## API Endpoints

### Upload Single File

```http
POST /api/assets/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: <file>
- folder: <optional folder path>
- tags: <comma-separated tags>
- context: <JSON context object>
- public_id: <optional custom public ID>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "asset_id",
    "public_id": "cloudinary_public_id",
    "secure_url": "https://res.cloudinary.com/...",
    "format": "jpg",
    "width": 1920,
    "height": 1080,
    "bytes": 245760,
    "created_at": "2025-10-07T12:00:00Z",
    "responsive_urls": {
      "thumbnail": "https://res.cloudinary.com/.../w_150,h_150,c_fill,q_auto,f_auto",
      "small": "https://res.cloudinary.com/.../w_300,h_300,c_limit,q_auto,f_auto",
      "medium": "https://res.cloudinary.com/.../w_600,h_600,c_limit,q_auto,f_auto",
      "large": "https://res.cloudinary.com/.../w_1200,h_1200,c_limit,q_auto,f_auto",
      "original": "https://res.cloudinary.com/.../q_auto,f_auto"
    }
  }
}
```

### Upload Multiple Files

```http
POST /api/assets/upload-multiple
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- files: <array of files>
- folder: <optional folder path>
- tags: <comma-separated tags>
- context: <JSON context object>
```

### Delete File

```http
DELETE /api/assets/{publicId}
Authorization: Bearer <token>
```

### List Assets

```http
GET /api/assets?folder=path&tags=tag1,tag2&limit=50&offset=0
Authorization: Bearer <token>
```

### Get Asset Details

```http
GET /api/assets/{publicId}
Authorization: Bearer <token>
```

### Generate Signed Upload URL

```http
POST /api/assets/signed-url
Content-Type: application/json
Authorization: Bearer <token>

{
  "folder": "optional/folder/path",
  "public_id": "optional-custom-id"
}
```

## Usage Examples

### Frontend Integration

#### Upload File with Progress

```typescript
const uploadFile = async (file: File, folder?: string) => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const response = await fetch("/api/assets/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.json();
};
```

#### Direct Client Upload

```typescript
const uploadDirectly = async (file: File) => {
  // Get signed upload URL
  const signedResponse = await fetch("/api/assets/signed-url", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder: "user-uploads" }),
  });

  const { uploadUrl, signature, timestamp } = await signedResponse.json();

  // Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("signature", signature);
  formData.append("timestamp", timestamp);
  formData.append("api_key", process.env.CLOUDINARY_API_KEY);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  return response.json();
};
```

#### Display Responsive Images

```typescript
const ResponsiveImage = ({
  publicId,
  alt,
  className,
}: {
  publicId: string;
  alt: string;
  className?: string;
}) => {
  const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;

  return (
    <picture className={className}>
      <source
        media="(max-width: 600px)"
        srcSet={`${baseUrl}/w_300,h_300,c_limit,q_auto,f_auto/${publicId}`}
      />
      <source
        media="(max-width: 1200px)"
        srcSet={`${baseUrl}/w_600,h_600,c_limit,q_auto,f_auto/${publicId}`}
      />
      <img
        src={`${baseUrl}/w_1200,h_1200,c_limit,q_auto,f_auto/${publicId}`}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
};
```

### Backend Service Usage

#### Upload with Transformations

```typescript
import { CloudinaryService } from "../lib/cloudinary";

const uploadWithTransformations = async (file: Express.Multer.File) => {
  const result = await CloudinaryService.uploadFile(file, {
    folder: "lead101/documents",
    tags: ["document", "application"],
    transformation: [
      { width: 800, height: 600, crop: "limit" },
      { quality: "auto", format: "auto" },
    ],
  });

  return result;
};
```

#### Generate Optimized URLs

```typescript
const getOptimizedUrl = (publicId: string, width: number, height: number) => {
  return CloudinaryService.generateOptimizedUrl(publicId, {
    width,
    height,
    crop: "fill",
    quality: "auto",
    format: "auto",
  });
};
```

## File Organization

### Folder Structure

```
lead101/
├── {tenantId}/           # Tenant-specific folder
│   ├── documents/        # Document uploads
│   ├── images/          # Image uploads
│   ├── forms/           # Form attachments
│   └── temp/            # Temporary files
├── shared/              # Shared assets
└── templates/           # Template files
```

### Tagging System

- **Document Types**: `document`, `image`, `video`, `archive`
- **Categories**: `application`, `profile`, `certificate`, `id-proof`
- **Status**: `pending`, `verified`, `rejected`
- **Custom Tags**: Institution-specific tags

## Security Features

### Authentication

- All endpoints require valid JWT authentication
- Tenant isolation ensures users can only access their assets
- Role-based permissions for asset management

### File Validation

- File type validation based on MIME types
- File size limits (configurable, default 10MB)
- Malware scanning (via Cloudinary's built-in features)

### Access Control

- Signed URLs for secure direct uploads
- Time-limited access tokens
- IP-based restrictions (configurable)

## Performance Optimization

### Image Optimization

- Automatic format conversion (WebP, AVIF)
- Quality optimization based on content
- Responsive image generation
- Lazy loading support

### Caching

- CDN-based caching via Cloudinary
- Browser caching with appropriate headers
- Edge location optimization

### Bandwidth Optimization

- Automatic image compression
- Format selection based on browser support
- Progressive JPEG loading

## Monitoring and Analytics

### Usage Tracking

- Upload/download statistics
- Storage usage per tenant
- Performance metrics
- Error tracking

### Cost Management

- Storage usage monitoring
- Bandwidth usage tracking
- Transformation usage analytics

## Error Handling

### Common Error Codes

- `NO_FILE`: No file provided in upload request
- `INVALID_FILE_TYPE`: File type not allowed
- `FILE_TOO_LARGE`: File exceeds size limit
- `UPLOAD_ERROR`: General upload failure
- `DELETE_ERROR`: File deletion failed
- `ASSET_NOT_FOUND`: Asset not found

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Additional error details
  }
}
```

## Best Practices

### File Naming

- Use descriptive, SEO-friendly names
- Include version numbers for updates
- Avoid special characters and spaces

### Organization

- Use consistent folder structures
- Apply meaningful tags
- Regular cleanup of unused assets

### Performance

- Optimize images before upload when possible
- Use appropriate image sizes for different use cases
- Implement lazy loading for better performance

### Security

- Validate all uploads on both client and server
- Implement virus scanning for uploaded files
- Use signed URLs for sensitive uploads
- Regular security audits

## Troubleshooting

### Common Issues

1. **Upload Failures**

   - Check file size limits
   - Verify file type is allowed
   - Ensure Cloudinary credentials are correct

2. **Image Not Displaying**

   - Verify public ID is correct
   - Check Cloudinary account status
   - Ensure proper URL generation

3. **Performance Issues**
   - Check image optimization settings
   - Verify CDN configuration
   - Monitor bandwidth usage

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## Migration Guide

### From Local Storage

If migrating from local file storage:

1. **Export existing files**: Create a list of all files with metadata
2. **Upload to Cloudinary**: Use batch upload API
3. **Update database**: Update file references to use Cloudinary URLs
4. **Test thoroughly**: Verify all file access works correctly
5. **Clean up**: Remove local files after successful migration

### Database Updates

The Asset model includes the following fields:

- `publicId`: Cloudinary public ID
- `secureUrl`: Cloudinary secure URL
- `format`: File format
- `width/height`: Image dimensions
- `bytes`: File size
- `folder`: Storage folder
- `tags`: Comma-separated tags
- `context`: JSON metadata

## Support

For issues related to Cloudinary integration:

1. Check the [Cloudinary Documentation](https://cloudinary.com/documentation)
2. Review error logs for specific error messages
3. Verify environment configuration
4. Test with minimal file uploads first

## Future Enhancements

Planned improvements include:

- Video upload and processing
- Advanced image transformations
- AI-powered image tagging
- Bulk operations API
- Advanced analytics dashboard
- Integration with document management systems
