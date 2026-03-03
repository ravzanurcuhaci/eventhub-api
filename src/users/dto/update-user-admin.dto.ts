import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'src/auth/roles.enum';

export class UpdateUserByAdminDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}