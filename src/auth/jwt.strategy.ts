import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

type JwtPayload = {
    sub: string;
    role: 'USER' | 'ORGANIZER' | 'ADMIN';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        //headerden bearer token al secret ile doğrula doğruysa payloadı validate e gönder
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
            ignoreExpiration: false,
        });
    }
    //payload sub ile dbden kullanıcıyı buluyor user varsa dönüyor yoksa exceptşon fırlatıyor
    //token olup kullanıcı silinirse dbden de kontrol sağlandığı için daha sağlamdır
    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true },
        });

        if (!user) throw new UnauthorizedException('User not found');
        return user;
    }
}