import { SetMetadata } from '@nestjs/common';
//Endpoint’e “şu rollere izin var” bilgisini metadata olarak koyduk.
export const ROLES_KEY = 'roles';
export type Role = 'USER' | 'ORGANIZER' | 'ADMIN';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);