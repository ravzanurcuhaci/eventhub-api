import { Injectable } from '@nestjs/common';

//db ile konuşır iş kurallarını uygular hesaplama yapar
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
