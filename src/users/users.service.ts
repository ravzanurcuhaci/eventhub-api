import { BadRequestException, ForbiddenException, Get, Injectable, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserByAdminDto } from './dto/update-user-admin.dto';
import { UpdateMeDto } from './dto/update-me.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private configService: ConfigService) { }

    findAllSafe() {
        return this.prisma.user.findMany({
            select: { id: true, email: true, role: true, createdAt: true },
        });
    }

    //me bu fonskiyon tokendaki kişinin verilerini döner
    findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, email: true, role: true,
            }
        });
    }
    private async ensureUserExists(id: string) {
        const existing = await this.prisma.user.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('User not found');
        return existing;
    }

    private async ensureEmailUnique(email: string, ignoreUserId: string) {
        const found = await this.prisma.user.findUnique({ where: { email } });
        if (found && found.id !== ignoreUserId) {
            throw new BadRequestException('Email already in use');
        }
    }

    async updateMe(userId: string, dto: UpdateMeDto) {
        const existing = await this.ensureUserExists(userId);

        if (dto.email && dto.email !== existing.email) {
            await this.ensureEmailUnique(dto.email, userId);
        }

        // Password hashlemek istersen:
        const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
        const passwordHash = dto.password ? await bcrypt.hash(dto.password, Number(saltRounds)) : undefined;

        return this.prisma.user.update({
            where: { id: userId },
            data: {
                email: dto.email,
                passwordHash: passwordHash,
            },
            select: { id: true, email: true, role: true, createdAt: true },
        });
    }

    async updateUserByAdmin(targetUserId: string, dto: UpdateUserByAdminDto) {
        const existing = await this.ensureUserExists(targetUserId);

        if (dto.email && dto.email !== existing.email) {
            await this.ensureEmailUnique(dto.email, targetUserId);
        }

        const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS') || 10;
        const passwordHash = dto.password ? await bcrypt.hash(dto.password, Number(saltRounds)) : undefined;

        return this.prisma.user.update({
            where: { id: targetUserId },
            data: {
                email: dto.email,
                role: dto.role,
                passwordHash: passwordHash,
            },
            select: { id: true, email: true, role: true, createdAt: true },
        });
    }
}
