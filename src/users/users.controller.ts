import { Body, Controller, ForbiddenException, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/decorators/user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { UpdateMeDto } from './dto/update-me.dto';
import { UpdateUserByAdminDto } from './dto/update-user-admin.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
    findAll() {
        return this.usersService.findAllSafe();
    }

    //user sadece kendini görsün
    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@User() user: { id: string }) {
        return this.usersService.findById(user.id);
    }


    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string, @User() user: { id: string; role: string }) {
        if (user.role !== 'ADMIN' && user.id !== id) {
            throw new ForbiddenException();
        }
        return this.usersService.findById(id);
    }


    // ✅ USER: sadece kendini update
    @UseGuards(JwtAuthGuard)
    @Patch('me')
    updateMe(@User() user: { id: string }, @Body() dto: UpdateMeDto) {
        return this.usersService.updateMe(user.id, dto);
    }

    // ✅ ADMIN: herhangi bir user'ı update
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    updateUserByAdmin(@Param('id') id: string, @Body() dto: UpdateUserByAdminDto) {
        return this.usersService.updateUserByAdmin(id, dto);
    }

}

