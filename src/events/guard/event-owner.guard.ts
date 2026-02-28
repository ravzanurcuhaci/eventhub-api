import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

        // Admin her şeyi düzenleyebilir
        if (user.role === Role.ADMIN) return true;

        // Organizer dışındaki roller zaten buraya gelmemeli ama güvenli kalsın
        if (user.role !== Role.ORGANIZER) {
            throw new ForbiddenException('Insufficient role');
        }

        const eventId = req.params?.id as string | undefined;
        if (!eventId) throw new ForbiddenException('Missing event id');

        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            select: { organizerId: true },
        });

        if (!event) throw new NotFoundException('Event not found');

        if (event.organizerId !== user.id) {
            throw new ForbiddenException('You can only edit your own event');
        }

        return true;
    }
}