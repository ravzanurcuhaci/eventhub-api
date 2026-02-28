import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@User() user: { id: string }, @Body() dto: CreateOrderDto) {
        return this.ordersService.createOrder(user.id, dto);

    }


    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancel(@Param('id') orderId: string) {
        return this.ordersService.cancelOrder(orderId);

    }

    @Patch(':id/pay')
    @UseGuards(JwtAuthGuard)
    async pay(@Param('id') orderId: string) {
        return this.ordersService.payOrder(orderId);
    }
}
