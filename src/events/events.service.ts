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

        if (organizer.role !== Role.ORGANIZER) {
            // Normalde buraya düşmez; düşerse sistemde bir açık/bug var demektir.
            throw new BadRequestException('User is not an organizer');
        }

        return this.prisma.event.create({
            data: {
                title: dto.title,
                description: dto.description,
                date: new Date(dto.date),
                organizerId,
                category: dto.category,
                location: dto.location,
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
                category: true,
                organizer: { select: { id: true, email: true, role: true } },
                ticketTypes: {
                    where: { isActive: true, stock: { gt: 0 } },
                    select: { id: true, name: true, price: true, stock: true },
                },
            },
        });

        if (!event) throw new NotFoundException('Event not found');

        return event;




    }


    async listEvents(query: ListEventsQueryDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        //skip → kaç kayıt atlanacak
        //take → kaç kayıt getirilecek
        const skip = (page - 1) * limit;
        const take = limit;

        //sadece aktif eventleri getir
        const where: Prisma.EventWhereInput = { isActive: true };

        // category validation and filtering
        if (query.category) {
            where.category = query.category;
        }

        const orderBy: Prisma.EventOrderByWithRelationInput = {};
        const sortBy = query.sortBy ?? 'date';
        const sortOrder = query.sortOrder ?? 'asc';

        // Sorting logic
        if (sortBy === 'title') {
            orderBy.title = sortOrder;
        } else if (sortBy === 'createdAt') {
            orderBy.createdAt = sortOrder;
        } else {
            orderBy.date = sortOrder;
        }

        //Transaction Kullanımı
        //Toplam kayıt sayısını alıyorsun, Sayfalı veriyi alıyorsun

        const [total, events] = await this.prisma.$transaction([
            //toplam kaç event var
            this.prisma.event.count({ where }),
            //sayfalı event verisi
            this.prisma.event.findMany({
                where,
                skip,
                take,
                orderBy,
                include: {
                    organizer: { select: { id: true, email: true, role: true } },
                    ticketTypes: {
                        where: { isActive: true },
                        select: { id: true, name: true, price: true, stock: true },
                    },
                },
            })
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


    //mine list
    findMine(userId: string) {
        return this.prisma.event.findMany({
            where: { organizerId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                ticketTypes: true,
            },
        });
    }

    async updateEvent(eventId: string, dto: UpdateEventDto, currentUser: { id: string; role: Role }) {
        const { ticketTypes, ...eventData } = dto;

        return this.prisma.$transaction(async (tx) => {
            // Event alanları
            await tx.event.update({
                where: { id: eventId },
                data: { ...eventData },
            });

            if (!ticketTypes) {
                return tx.event.findUnique({ where: { id: eventId }, include: { ticketTypes: true } });
            }

            const existing = await tx.ticketType.findMany({
                where: { eventId },
                select: { id: true },
            });
            const existingIds = new Set(existing.map(x => x.id));
            const incomingIds = new Set(ticketTypes.filter(t => t.id).map(t => t.id!));

            // update
            for (const t of ticketTypes) {
                if (t.id) {
                    await tx.ticketType.update({
                        where: { id: t.id },
                        data: { name: t.name, price: t.price, stock: t.stock, isActive: true },
                    });
                }
            }

            // create
            const toCreate = ticketTypes.filter(t => !t.id);
            if (toCreate.length) {
                await tx.ticketType.createMany({
                    data: toCreate.map(t => ({
                        eventId,
                        name: t.name,
                        price: t.price,
                        stock: t.stock,
                        isActive: true,
                    })),
                });
            }

            // DTO’da olmayanları pasif et
            const toDisable = [...existingIds].filter(id => !incomingIds.has(id));
            if (toDisable.length) {
                await tx.ticketType.updateMany({
                    where: { id: { in: toDisable } },
                    data: { isActive: false },
                });
            }

            return tx.event.findUnique({
                where: { id: eventId },
                include: { ticketTypes: true },
            });
        });
    }

    async deleteEvent(eventId: string, currentUser: { id: string; role: Role }) {
        // 1) Olayın veritabanında var olup olmadığını kontrol et.
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { id: true, organizerId: true },
        });

        if (!event) throw new NotFoundException('Event not found');

        // 2) Yetki kontrolü yap.
        // Eğer kullanıcı ADMIN değilse, ve ORGANIZER ise ama olayın sahibi değilse hata fırlat.
        if (currentUser.role !== Role.ADMIN) {
            if (currentUser.role !== Role.ORGANIZER || event.organizerId !== currentUser.id) {
                throw new ForbiddenException('You can only delete your own event');
            }
        }

        // 3) Yetki başarılı, silme (soft delete) işlemini transaction içerisinde yap.
        await this.prisma.$transaction(async (tx) => {
            await tx.ticketType.updateMany({
                where: { eventId },
                data: { isActive: false },
            });

            await tx.event.update({
                where: { id: eventId },
                data: { isActive: false },
            });
        });
    }

}