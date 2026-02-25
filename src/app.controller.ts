import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
//controller http request alır parametre parse eder service çağırır response döner 
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
