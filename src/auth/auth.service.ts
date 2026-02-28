import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwt: JwtService,
    ) { }

    private async hashPassword(password: string) {
        return bcrypt.hash(password, 12);
    }

    async register(dto: RegisterDto) {
        const exists = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (exists) throw new ConflictException('Email already in use');

        const passwordHash = await this.hashPassword(dto.password);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                role: dto.role ?? 'USER',
            },
            select: { id: true, email: true, role: true },
        });

        const accessToken = await this.jwt.signAsync({
            sub: user.id,
        });

        return { user, accessToken };
    }
    //token üretimi
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Invalid credentials');

        //jwt burada oluşuyor
        const accessToken = await this.jwt.signAsync({
            //JWT içinde tutlan bilgiler 
            sub: user.id,
        });

        return {
            user: { id: user.id, email: user.email, role: user.role },
            accessToken,
        };
    }
}