import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import "multer";

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>("CLOUDINARY_CLOUD_NAME")?.trim();
    const apiKey = this.config.get<string>("CLOUDINARY_API_KEY")?.trim();
    const apiSecret = this.config.get<string>("CLOUDINARY_API_SECRET")?.trim();

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are missing or incomplete.",
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  async uploadCaseCover(file: Express.Multer.File): Promise<{
    url: string;
    publicId: string;
    secureUrl: string;
  }> {
    try {
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedMimes.includes(file.mimetype)) {
        throw new Error("Invalid File Type. Only JPG, PNG, and WebP are allowed.");
      }

      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "casefile/covers",
            resource_type: "image",
          },
          (error, result: UploadApiResponse | undefined) => {
            if (error || !result) {
              console.error("Cloudinary upload error details:", error);
              return reject(
                error || new Error("Cloudinary upload failed with empty response"),
              );
            }
            resolve({
              url: result.secure_url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
      });
    } catch (error: any) {
      console.error("Cloudinary service error:", error);
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      const message = error?.message || "Image upload failed. Please verify Cloudinary credentials and network connection.";
      throw new ServiceUnavailableException(message);
    }
  }
}
