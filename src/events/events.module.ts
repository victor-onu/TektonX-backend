import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRegistration]), MailModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
