import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../roles.decorator';
import { Role } from '../roles.enum';
//@Roles('ORGANIZER') metadata’sını okuyup req.user.role ile karşılaştırdık.
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    //reflektör ile metadat okuyoruz
    //SetMetadata endpoint’e “şu roller girebilir” bilgisini yapıştırır.
    //Guard bu metadata’yı okuyup karar verir.
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user as { role?: Role } | undefined;

        if (!user?.role) throw new ForbiddenException('Missing role');

        const ok = requiredRoles.includes(user.role);
        if (!ok) throw new ForbiddenException('Insufficient role');

        return true;
    }
}