import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  type: process.env.STORAGE_TYPE || 'local',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  s3Bucket: process.env.S3_BUCKET || '',
  s3Region: process.env.S3_REGION || '',
  s3AccessKey: process.env.S3_ACCESS_KEY || '',
  s3SecretKey: process.env.S3_SECRET_KEY || '',
}));
