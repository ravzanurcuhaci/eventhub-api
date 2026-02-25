import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
//controllers, HTTP katmanı
//providers iş mantığı
//imports başka modüller

@Module({
  imports: [UsersModule, AuthModule, EventsModule, PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true, // her modülde tek tek import etme derdi bitsin
      // envFilePath: '.env', // default zaten bu, gerekirse açarsın
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
