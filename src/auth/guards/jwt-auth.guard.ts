import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//Passport’un jwt strategy’sini “guard” olarak paketledik.
//Controller’da @UseGuards(JwtAuthGuard) diyerek endpoint’i kilitlemek için.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }