import { IsEmail, IsString, MaxLength, MinLength, minLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(72)
    password: string;
}