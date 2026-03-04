import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
//controllers, HTTP katmanı
//providers iş mantığı
//imports başka modüller

@Module({
  imports: [
    UsersModule,
    AuthModule,
    EventsModule,
    PrismaModule,
    OrdersModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 30000, // 30 seconds
      limit: 2,   // 2 requests
    }]),
    ScheduleModule.forRoot(),
    MailModule,
  ],
  controllers: [AppController, OrdersController],
  providers: [AppService, OrdersService],
})
export class AppModule { }
