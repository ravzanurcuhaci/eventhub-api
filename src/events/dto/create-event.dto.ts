import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateTicketTypeDto } from './create-ticket-type.dto';
import { Type } from 'class-transformer';
import { EventCategory } from '@prisma/client';

export class CreateEventDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsEnum(EventCategory)
    category?: EventCategory;


    @IsString()
    @IsOptional()
    location?: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateTicketTypeDto)
    ticketTypes?: CreateTicketTypeDto[];
}


