import { IsDateString, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateTicketTypeDto } from './create-ticket-type.dto';
import { Type } from 'class-transformer';

export class CreateEventDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    date: string;


    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateTicketTypeDto)
    ticketTypes?: CreateTicketTypeDto[];
}