import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;

    @IsOptional()
    @IsIn(['USER', 'ORGANIZER'])
    role?: 'USER' | 'ORGANIZER';

}