import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
//@global tek seferde import etmek için
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule { }
