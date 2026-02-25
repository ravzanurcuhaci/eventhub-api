import { IsInt, IsOptional, Max, Min } from "class-validator";

export class ListEventsQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}