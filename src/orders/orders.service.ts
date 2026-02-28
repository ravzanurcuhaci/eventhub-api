import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
    constructor(private readonly prisma: PrismaService) { }

    async createOrder(userId: string, dto: CreateOrderDto) {
        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('Order items required');
        }

        // Aynı ticketTypeId birden fazla geldiyse birleştir (daha temiz + doğru)
        const aggregated = new Map<string, number>();
        for (const item of dto.items) {
            aggregated.set(item.ticketTypeId, (aggregated.get(item.ticketTypeId) ?? 0) + item.quantity);
        }
        const items = Array.from(aggregated.entries()).map(([ticketTypeId, quantity]) => ({
            ticketTypeId,
            quantity,
        }));

        return this.prisma.$transaction(async (tx) => {
            // 1) İstenen ticketType'ları çek (fiyatı DB'den alacağız)
            const ticketTypes = await tx.ticketType.findMany({
                where: { id: { in: items.map((i) => i.ticketTypeId) } },
                select: { id: true, price: true },
            });

            if (ticketTypes.length !== items.length) {
                throw new NotFoundException('Some ticket types not found');
            }

            const priceMap = new Map(ticketTypes.map((t) => [t.id, t.price]));

            // 2) Stock düşürme (race-condition safe)
            // Atomik: UPDATE ... WHERE stock >= qty
            for (const item of items) {
                const result = await tx.ticketType.updateMany({
                    where: {
                        id: item.ticketTypeId,
                        stock: { gte: item.quantity },
                    },
                    data: {
                        stock: { decrement: item.quantity },
                    },
                });

                if (result.count !== 1) {
                    throw new BadRequestException(
                        `Insufficient stock for ticketTypeId=${item.ticketTypeId}`,
                    );
                }
            }

            // 3) Total hesapla (priceMap garanti var)
            const total = items.reduce((sum, item) => {
                const unitPrice = priceMap.get(item.ticketTypeId);
                if (unitPrice == null) throw new Error('Price missing (unexpected)');
                return sum + unitPrice * item.quantity;
            }, 0);

            // 4) Order + nested OrderItem create
            // ÖNEMLİ: OrderItem içinde "ticketType" relation zorunlu => connect kullanıyoruz
            const order = await tx.order.create({
                data: {
                    userId,
                    total,
                    // status default PENDING, yazmasan da olur
                    items: {
                        create: items.map((item) => {
                            const unitPrice = priceMap.get(item.ticketTypeId);
                            if (unitPrice == null) throw new Error('Price missing (unexpected)');

                            return {
                                quantity: item.quantity,
                                unitPrice,
                                ticketType: { connect: { id: item.ticketTypeId } }, // 👈 HATA BURADA ÇÖZÜLÜYOR
                            };
                        }),
                    },
                },
                include: {
                    items: {
                        include: {
                            ticketType: true, // istersen kaldır
                        },
                    },
                },
            });

            return order;
        });
    }



    async cancelOrder(orderId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { items: true }
            });

            if (!order) throw new NotFoundException('Order not found');

            if (order.status === OrderStatus.CANCELED) {
                return order;
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException('Only PENDING orders can be canceled');

            }

            // stock geri ekle
            for (const item of order.items) {
                await tx.ticketType.update({
                    where: { id: item.ticketTypeId },
                    data: {
                        stock: { increment: item.quantity },
                    },
                });
            }
            // order status güncelle
            const updated = await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.CANCELED },
                include: { items: true },
            });

            return updated;

        });
    }

    /**
   * PAY:
   * - Order bulunur
   * - Sadece PENDING ise PAID yapılır
   * - Hepsi tek transaction (basit)
   */
    async payOrder(orderId: string) {
        return this.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                select: { id: true, status: true },
            });

            if (!order) throw new NotFoundException('Order not found');

            if (order.status === OrderStatus.PAID) {
                // idempotent: zaten paid ise dön
                return tx.order.findUnique({
                    where: { id: orderId },
                    include: { items: true },
                });
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException('Only PENDING orders can be paid');
            }

            return tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.PAID },
                include: { items: true },
            });
        });
    }

}