import { CloudinaryService } from "../lib/cloudinary";

// Mock environment variables for testing
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";

describe("CloudinaryService", () => {
  describe("generateOptimizedUrl", () => {
    it("should generate optimized URL with transformations", () => {
      const publicId = "test-image";
      const transformations = {
        width: 300,
        height: 200,
        crop: "fill",
        quality: "auto",
      };

      const url = CloudinaryService.generateOptimizedUrl(
        publicId,
        transformations
      );

      expect(url).toContain("test-image");
      expect(url).toContain("w_300");
      expect(url).toContain("h_200");
      expect(url).toContain("c_fill");
      expect(url).toContain("q_auto");
    });

    it("should generate URL without transformations", () => {
      const publicId = "test-image";
      const url = CloudinaryService.generateOptimizedUrl(publicId);

      expect(url).toContain("test-image");
      expect(url).toContain("https://res.cloudinary.com");
    });
  });

  describe("generateResponsiveUrls", () => {
    it("should generate all responsive URL variants", () => {
      const publicId = "test-image";
      const urls = CloudinaryService.generateResponsiveUrls(publicId);

      expect(urls).toHaveProperty("thumbnail");
      expect(urls).toHaveProperty("small");
      expect(urls).toHaveProperty("medium");
      expect(urls).toHaveProperty("large");
      expect(urls).toHaveProperty("original");

      expect(urls.thumbnail).toContain("w_150,h_150");
      expect(urls.small).toContain("w_300,h_300");
      expect(urls.medium).toContain("w_600,h_600");
      expect(urls.large).toContain("w_1200,h_1200");
    });
  });

  describe("generateSignedUploadUrl", () => {
    it("should generate signed upload URL with folder", () => {
      const folder = "test-folder";
      const result = CloudinaryService.generateSignedUploadUrl(folder);

      expect(result).toHaveProperty("uploadUrl");
      expect(result).toHaveProperty("signature");
      expect(result).toHaveProperty("timestamp");
      expect(result.uploadUrl).toContain("api.cloudinary.com");
    });

    it("should generate signed upload URL with custom public ID", () => {
      const folder = "test-folder";
      const publicId = "custom-id";
      const result = CloudinaryService.generateSignedUploadUrl(
        folder,
        publicId
      );

      expect(result).toHaveProperty("uploadUrl");
      expect(result).toHaveProperty("signature");
      expect(result).toHaveProperty("timestamp");
    });
  });
});
