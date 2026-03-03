import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../auth/roles.enum';

@Injectable()
export class EventOwnerGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user as { id?: string; role?: Role } | undefined;

        if (!user?.id || !user?.role) {
            throw new ForbiddenException('Missing user info');
        }

        // Admin her şeyi yapabilir (delete dahil)
        if (user.role === Role.ADMIN) return true;

        // Organizer değilse yasak
        if (user.role !== Role.ORGANIZER) {
            throw new ForbiddenException('Insufficient role');
        }

        // Param adı ile route aynı olmalı: :eventId
        const eventId = req.params?.eventId as string | undefined;
        if (!eventId) throw new BadRequestException('Missing event id');

        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { organizerId: true },
        });

        if (!event) throw new NotFoundException('Event not found');

        if (event.organizerId !== user.id) {
            throw new ForbiddenException('You can only manage your own event');
        }

        return true;
    }
}