import { IsInt, IsNotEmpty, IsPositive, IsString, Min, IsOptional } from "class-validator";

export class CreateTicketTypeDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsPositive()
    price: number;

    @IsInt()
    @Min(0)
    stock: number;

}