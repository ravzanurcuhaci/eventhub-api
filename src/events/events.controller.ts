import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import type { RequestUser } from '../auth/types/request-user.type';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { ListEventsQueryDto } from './dto/list-events.dto';
import { EventIdParamDto } from './dto/event-id.param.dto';

@Controller('events')
export class EventsController {
    constructor(private readonly events: EventsService) { }
    //create
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ORGANIZER')
    create(
        @Body() dto: CreateEventDto,
        @User() user: RequestUser,
    ) {
        return this.events.create(dto, user.id);
    }

    //ticketType create
    @Post(':eventId/ticket-types')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ORGANIZER')
    async createTicketType(
        @Param('eventId') eventId: string,
        @Body() dto: CreateTicketTypeDto,
        @User() user: RequestUser,
    ) {
        return this.events.createTicketType(eventId, dto, user.id);
    }


    @Get(':eventId')
    async getById(@Param() params: EventIdParamDto) {
        return this.events.getEventById(params.eventId);
    }

    //event listeleme
    @Get()
    async list(@Query() query: ListEventsQueryDto) {
        return this.events.listEvents(query);
    }




}