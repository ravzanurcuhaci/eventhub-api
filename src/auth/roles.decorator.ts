import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';
//Endpoint’e “şu rollere izin var” bilgisini metadata olarak koyduk.
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);