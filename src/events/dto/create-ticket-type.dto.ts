import { IsInt, IsNotEmpty, IsPositive, IsString, Min } from "class-validator";

export class CreateTicketTypeDto {

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