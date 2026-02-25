import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../roles.decorator';
//@Roles('ORGANIZER') metadata’sını okuyup req.user.role ile karşılaştırdık.
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = ctx.switchToHttp().getRequest();
        const user = req.user as { role?: Role } | undefined;

        if (!user?.role) throw new ForbiddenException('Missing role');

        const ok = requiredRoles.includes(user.role);
        if (!ok) throw new ForbiddenException('Insufficient role');

        return true;
    }
}