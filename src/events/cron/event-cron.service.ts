import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EventCronService {
    private readonly logger = new Logger(EventCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    // Her gece 00:00'da çalışır
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handlePassedEvents() {
        this.logger.log('Started checking for past events...');
        const now = new Date();

        try {
            const result = await this.prisma.event.updateMany({
                where: {
                    date: { lt: now }, // Tarihi şu andan eski olanlar
                    status: { not: 'COMPLETED' }, // Henüz tamamlanmamış olanlar
                },
                data: {
                    status: 'COMPLETED',
                },
            });

            if (result.count > 0) {
                this.logger.log(`Successfully updated ${result.count} past events to COMPLETED status.`);
            } else {
                this.logger.log('No past events found to update.');
            }
        } catch (error) {
            this.logger.error('Error while updating past events', error.stack);
        }
    }
}
