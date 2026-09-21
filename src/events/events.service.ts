import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isEmail } from 'class-validator';
import { marked } from 'marked';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { EmailRegistrantsDto } from './dto/email-registrants.dto';
import { MailService } from '../mail/mail.service';
import { AuditLogService } from '../audit-log/audit-log.service';

type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepo: Repository<EventRegistration>,
    private readonly mailService: MailService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findBySlug(slug: string): Promise<Event> {
    const event = await this.eventRepo.findOne({ where: { slug } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async findAll(): Promise<Event[]> {
    return this.eventRepo.find({ order: { startsAt: 'ASC' } });
  }

  async register(
    slug: string,
    dto: CreateEventRegistrationDto,
  ): Promise<{ message: string }> {
    const event = await this.findBySlug(slug);
    // Normalize so "Foo@Bar.com" and "foo@bar.com" are treated as the same
    // applicant — both for the duplicate check below and for what's stored.
    const email = dto.email.trim().toLowerCase();

    const duplicateMessage =
      'This email has already been used to apply for this event.';

    const existing = await this.registrationRepo.findOne({
      where: { eventId: event.id, email },
    });
    if (existing) {
      throw new ConflictException(duplicateMessage);
    }

    const registration = this.registrationRepo.create({
      eventId: event.id,
      name: dto.name,
      email,
      phone: dto.phone,
      role: dto.role,
      organisation: dto.organisation ?? null,
      volunteer: dto.volunteer ?? null,
      question: dto.question ?? null,
    });

    try {
      await this.registrationRepo.save(registration);
    } catch (err) {
      // Belt-and-braces against a race between two near-simultaneous
      // submissions with the same email (the findOne check above can't
      // catch that) — the DB's unique(event_id, email) index rejects the
      // second insert with Postgres error 23505 (unique_violation).
      if ((err as { code?: string })?.code === '23505') {
        throw new ConflictException(duplicateMessage);
      }
      throw err;
    }

    this.mailService
      .sendEventRegistrationConfirmation(email, dto.name, event.name)
      .catch(() => {});
    this.mailService
      .sendEventRegistrationAdminNotification(event.name, { ...dto, email })
      .catch(() => {});
    return { message: 'Thank you. Watch your email for the confirmation.' };
  }

  async findRegistrations(slug: string): Promise<EventRegistration[]> {
    const event = await this.findBySlug(slug);
    return this.registrationRepo.find({
      where: { eventId: event.id },
      order: { createdAt: 'DESC' },
    });
  }

  async exportRegistrationsCsv(slug: string): Promise<string> {
    const registrations = await this.findRegistrations(slug);
    const header =
      'id,name,email,phone,role,organisation,volunteer,question,createdAt\n';
    const rows = registrations
      .map((r) => {
        const question = (r.question ?? '').replace(/"/g, '""');
        return `${r.id},"${r.name}","${r.email}","${r.phone}","${r.role}","${r.organisation ?? ''}","${r.volunteer ?? ''}","${question}","${r.createdAt.toISOString()}"`;
      })
      .join('\n');
    return header + rows;
  }

  // Community managers' "email registrants" feature — All / Volunteers-only /
  // a manually typed list (which doesn't have to match any registrant at
  // all, e.g. a speaker or partner). Mirrors the general broadcast feature's
  // batching pattern (admin.service.ts's sendBroadcast) but scoped to one
  // event's audience and with attachment support.
  async emailRegistrants(
    slug: string,
    dto: EmailRegistrantsDto,
    files: Express.Multer.File[],
    actorId: string,
  ): Promise<{ sent: number; failed: number }> {
    const event = await this.findBySlug(slug);

    let recipients: { name: string; email: string }[];
    if (dto.audience === 'manual') {
      const raw = (dto.manualEmails ?? '')
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean);
      const invalid = raw.filter((e) => !isEmail(e));
      if (invalid.length > 0) {
        throw new BadRequestException(
          `These don't look like valid email addresses: ${invalid.join(', ')}`,
        );
      }
      const deduped = [...new Set(raw.map((e) => e.toLowerCase()))];
      recipients = deduped.map((email) => ({ name: '', email }));
    } else {
      const where =
        dto.audience === 'volunteers'
          ? { eventId: event.id, volunteer: 'yes' }
          : { eventId: event.id };
      const registrations = await this.registrationRepo.find({ where });
      recipients = registrations.map((r) => ({ name: r.name, email: r.email }));
    }

    if (recipients.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const htmlBody = await marked.parse(dto.body, {
      breaks: true,
      async: true,
    });
    const attachments: MailAttachment[] = (files ?? []).map((f) => ({
      filename: f.originalname,
      content: f.buffer,
      contentType: f.mimetype,
    }));

    let sent = 0;
    let failed = 0;
    const batchSize = 25;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      const results = await Promise.allSettled(
        batch.map((r) =>
          this.mailService.sendEventRegistrantEmail(
            r.email,
            r.name || 'there',
            dto.subject,
            htmlBody,
            attachments,
          ),
        ),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') sent++;
        else failed++;
      }
    }

    await this.auditLogService.log({
      adminId: actorId,
      action: 'event_registrants_email_sent',
      targetType: 'event',
      targetId: event.id,
      details: {
        subject: dto.subject,
        audience: dto.audience,
        attachmentCount: attachments.length,
        sent,
        failed,
      },
    });

    return { sent, failed };
  }
}
