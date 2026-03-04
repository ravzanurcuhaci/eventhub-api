import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventCronService } from './cron/event-cron.service';

@Module({
  providers: [EventsService, EventCronService],
  controllers: [EventsController]
})
export class EventsModule { }
