import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
//PrismaService artık PrismaClient’ın tüm metodlarına sahip.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleDestroy() {
        await this.$disconnect();
    }
    //Bu modül hazır olduğunda çalıştır.
    async onModuleInit() {
        await this.$connect();
    }

}
