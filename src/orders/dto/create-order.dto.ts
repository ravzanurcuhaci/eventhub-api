import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from "class-validator";

class OrderItemInput {
    @IsString()
    @IsNotEmpty()
    ticketTypeId: string;

    @IsInt()
    @Min(1)
    quantity: number;

}

export class CreateOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemInput)
    items: OrderItemInput[];
}