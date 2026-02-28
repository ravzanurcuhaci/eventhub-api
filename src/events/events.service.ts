import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { ListEventsQueryDto } from './dto/list-events.dto';
import { Prisma } from '@prisma/client';
import { Role } from 'src/auth/roles.enum';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateEventDto, organizerId: string) {
        const organizer = await this.prisma.user.findUnique({
            where: { id: organizerId },
            select: { id: true, role: true },
        });

        if (!organizer) {
            throw new BadRequestException('Organizer not found');
        }

        if (organizer.role !== 'ORGANIZER') {
            // Normalde buraya düşmez; düşerse sistemde bir açık/bug var demektir.
            throw new BadRequestException('User is not an organizer');
        }

        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: new Date(dto.date),
                organizerId,
                ticketTypes: {
                    create: dto.ticketTypes || [],
                },
            },
            include: {
                ticketTypes: true,
            },
        });
    }

    //ticketType create service

    async createTicketType(eventId: string, dto: CreateTicketTypeDto, organizerId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true, organizerId: true },

        })

        if (!event) throw new NotFoundException('Event not found');
        if (event.organizerId !== organizerId) throw new ForbiddenException('Not your event');


        try {

            return await this.prisma.ticketType.create({
                data: {
                    eventId,
                    name: dto.name,
                    price: dto.price,
                    stock: dto.stock,
                },
                select: {
                    id: true,
                    eventId: true,
                    name: true,
                    price: true,
                    stock: true,
                }
            });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                if (err.code === 'P2002') {
                    throw new ConflictException('Ticket type with this name already exists for this event');
                }
            }
            throw err;
        }
    }

    async getEventById(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: {
                id: true,
                title: true,
                description: true,
                date: true,
                location: true,
                organizer: { select: { id: true, email: true, role: true }, },
                ticketTypes: {
                    where: { stock: { gt: 0 } }, // Sadece stokta olan bilet türlerini göster
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        stock: true,
                    }
                }
            },
        });


        if (!event) throw new NotFoundException('Event not found');

        return event;




    }


    //event listeleme
    async listEvents(query: ListEventsQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        const skip = (page - 1) * limit;
        const take = limit;

        const [total, events] = await this.prisma.$transaction([
            this.prisma.event.count(),
            this.prisma.event.findMany({
                skip,
                take,
                orderBy: { date: 'asc' },
                include: {
                    organizer: { select: { id: true, email: true, role: true }, },
                    ticketTypes: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            stock: true,
                        }
                    }
                },

            }),
        ]);
        return {
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            items: events,
        };
    }

    // update event
    async updateEvent(
        eventId: string,
        dto: UpdateEventDto,
        currentUser: { id: string; role: Role },
    ) {
        const { ticketTypes, ...eventData } = dto;

        // Admin: direkt id ile update
        if (currentUser.role === Role.ADMIN) {
            return this.prisma.event.update({
                where: { id: eventId },
                data: {
                    ...eventData,
                    ...(ticketTypes
                        ? {
                            ticketTypes: {
                                deleteMany: {}, // bu event'e bağlı tüm ticketType'ları sil
                                create: ticketTypes.map((t) => ({
                                    name: t.name,
                                    price: t.price,
                                    stock: t.stock,
                                })),
                            },
                        }
                        : {}),
                },
            });
        }

        // Organizer: updateMany yerine "where'e organizerId şartı koyarak update" yap
        // (updateMany nested write desteklemediği için)
        return this.prisma.event.update({
            where: {
                // Prisma schema'nda böyle bir compound unique yoksa aşağıdaki alternatife bak
                id: eventId,
            },
            data: {
                ...eventData,
                ...(ticketTypes
                    ? {
                        ticketTypes: {
                            deleteMany: {},
                            create: ticketTypes.map((t) => ({
                                name: t.name,
                                price: t.price,
                                stock: t.stock,
                            })),
                        },
                    }
                    : {}),
            },
        });
    }

}