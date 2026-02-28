import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';

//PArtialType createEventDto'nun tüm alanlarını opsiyonel yapar.
export class UpdateEventDto extends PartialType(CreateEventDto) { }