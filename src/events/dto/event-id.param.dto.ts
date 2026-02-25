import { IsNotEmpty, IsString } from "class-validator";

// /events/ gibi bi paramtere gelirse boşsa yakalar
export class EventIdParamDto {
    @IsString()
    @IsNotEmpty()
    eventId: string;
}