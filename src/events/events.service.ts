import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { CreateEventRegistrationDto } from './dto/create-event-registration.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepo: Repository<EventRegistration>,
    private readonly mailService: MailService,
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
    const registration = this.registrationRepo.create({
      eventId: event.id,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      organisation: dto.organisation ?? null,
      volunteer: dto.volunteer ?? null,
      question: dto.question ?? null,
    });
    await this.registrationRepo.save(registration);
    this.mailService
      .sendEventRegistrationConfirmation(dto.email, dto.name, event.name)
      .catch(() => {});
    this.mailService
      .sendEventRegistrationAdminNotification(event.name, dto)
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
}
