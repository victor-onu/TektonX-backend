import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { Announcement } from './entities/announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

// Extract Cloudinary public_id from a secure_url
// e.g. https://res.cloudinary.com/<cloud>/image/upload/v123/tektonx/fliers/abc.jpg → tektonx/fliers/abc
function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

@Injectable()
export class AnnouncementsService {
  private readonly logger = new Logger(AnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepo: Repository<Announcement>,
  ) {}

  async getAll(): Promise<Announcement[]> {
    return this.announcementRepo.find({ order: { date: 'DESC' } });
  }

  async getById(id: string): Promise<Announcement> {
    const a = await this.announcementRepo.findOne({ where: { id } });
    if (!a) throw new NotFoundException('Announcement not found');
    return a;
  }

  async create(dto: CreateAnnouncementDto, userId: string): Promise<Announcement> {
    const announcement = this.announcementRepo.create({ ...dto, createdBy: userId });
    const saved = await this.announcementRepo.save(announcement);
    this.logger.log(`New announcement created: ${saved.title}`);
    return saved;
  }

  async update(id: string, dto: UpdateAnnouncementDto): Promise<Announcement> {
    const a = await this.getById(id);
    // If flier is being replaced or removed, delete the old one from Cloudinary
    if ('flierUrl' in dto && dto.flierUrl !== a.flierUrl && a.flierUrl) {
      const publicId = extractPublicId(a.flierUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          this.logger.warn(`Failed to delete old flier from Cloudinary: ${publicId}`, err);
        }
      }
    }
    Object.assign(a, dto);
    return this.announcementRepo.save(a);
  }

  async delete(id: string): Promise<void> {
    const a = await this.getById(id);
    // Delete flier from Cloudinary if present
    if (a.flierUrl) {
      const publicId = extractPublicId(a.flierUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          this.logger.warn(`Failed to delete flier from Cloudinary: ${publicId}`, err);
        }
      }
    }
    await this.announcementRepo.remove(a);
  }
}
