import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Upload } from './entities/upload.entity';

// ── File size limits ──────────────────────────────────────────────────────────
export const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,    // 5 MB — profile photos
  flier: 2 * 1024 * 1024,    // 2 MB — event fliers
  document: 10 * 1024 * 1024, // 10 MB — task attachments
} as const;

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' = 'image',
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: `tektonx/${folder}`, resource_type: resourceType }, (err, result) => {
        if (err || !result) return reject(err ?? new Error('Upload failed'));
        resolve(result);
      })
      .end(buffer);
  });
}

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload) private readonly uploadRepo: Repository<Upload>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
    taskId?: string,
  ): Promise<Upload> {
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    const isDoc = ALLOWED_DOC_TYPES.includes(file.mimetype);

    if (!isImage && !isDoc) {
      throw new BadRequestException(
        'Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, PDF, DOC, DOCX, TXT',
      );
    }

    const limit = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.document;
    if (file.size > limit) {
      const mb = limit / 1024 / 1024;
      throw new BadRequestException(`File too large. Maximum size is ${mb}MB for this file type.`);
    }

    const folder = isImage ? 'uploads' : 'documents';
    const resourceType = isImage ? 'image' : 'raw';
    const result = await uploadToCloudinary(file.buffer, folder, resourceType);

    const upload = this.uploadRepo.create({
      userId,
      taskId,
      filename: file.originalname,
      fileUrl: result.secure_url,
      fileType: file.mimetype,
      fileSize: file.size,
    });
    return this.uploadRepo.save(upload);
  }

  async uploadFlier(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Flier must be an image (JPEG, PNG, WEBP, or GIF).');
    }
    if (file.size > FILE_SIZE_LIMITS.flier) {
      throw new BadRequestException('Flier image must be 2MB or less.');
    }
    const result = await uploadToCloudinary(file.buffer, 'fliers', 'image');
    return result.secure_url;
  }

  async uploadProfilePhoto(file: Express.Multer.File): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Profile photo must be an image (JPEG, PNG, WEBP, or GIF).');
    }
    if (file.size > FILE_SIZE_LIMITS.image) {
      throw new BadRequestException('Profile photo must be 5MB or less.');
    }
    const result = await uploadToCloudinary(file.buffer, 'profiles', 'image');
    return result.secure_url;
  }

  async getById(id: string): Promise<Upload> {
    const u = await this.uploadRepo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Upload not found');
    return u;
  }

  async getByTaskId(taskId: string): Promise<Upload[]> {
    return this.uploadRepo.find({ where: { taskId } });
  }

  async getByUserId(userId: string): Promise<Upload[]> {
    return this.uploadRepo.find({ where: { userId } });
  }

  async deleteUpload(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<{ message: string }> {
    const upload = await this.getById(id);
    if (!isAdmin && upload.userId !== userId) throw new ForbiddenException('Access denied');

    // Delete from Cloudinary
    try {
      const urlParts = upload.fileUrl.split('/');
      const filenameWithExt = urlParts[urlParts.length - 1];
      const folderPart = urlParts[urlParts.length - 2];
      const publicId = `tektonx/${folderPart}/${filenameWithExt.split('.')[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch {
      // Don't block deletion if Cloudinary removal fails
    }

    await this.uploadRepo.remove(upload);
    return { message: 'File deleted' };
  }
}
