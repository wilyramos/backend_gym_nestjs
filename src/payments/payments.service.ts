// src/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { MercadoPagoService } from '../gateways/mercadopago/mercadopago.service';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentsRepo: Repository<Payment>,

        @InjectRepository(Subscription)
        private readonly subscriptionsRepo: Repository<Subscription>,

        private readonly mercadoPagoService: MercadoPagoService,
    ) { }

    async createPayment(subscriptionId: number, data: Partial<Payment>): Promise<Payment> {
        const subscription = await this.subscriptionsRepo.findOne({
            where: { id: subscriptionId },
        });
        if (!subscription) {
            throw new NotFoundException(`Subscription ${subscriptionId} not found`);
        }

        const payment = this.paymentsRepo.create({
            ...data,
            subscription,
            status: PaymentStatus.PENDING,
        });

        return this.paymentsRepo.save(payment);
    }

    async confirmPayment(paymentId: number, externalId?: string): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

        payment.status = PaymentStatus.APPROVED;
        if (externalId) payment.externalId = externalId;

        return this.paymentsRepo.save(payment);
    }

    async failPayment(paymentId: number): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

        payment.status = PaymentStatus.FAILED;
        return this.paymentsRepo.save(payment);
    }

    async refundPayment(paymentId: number): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({ where: { id: paymentId } });
        if (!payment) throw new NotFoundException(`Payment ${paymentId} not found`);

        payment.status = PaymentStatus.REFUNDED;
        return this.paymentsRepo.save(payment);
    }

    async findBySubscription(subscriptionId: number): Promise<Payment[]> {
        return this.paymentsRepo.find({
            where: { subscription: { id: subscriptionId } },
            order: { paymentDate: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Payment> {
        const payment = await this.paymentsRepo.findOne({ where: { id } });
        if (!payment) throw new NotFoundException(`Payment ${id} not found`);
        return payment;
    }

    async findByUser(userId: number) {
        const payments = await this.paymentsRepo.find({
            where: { subscription: { user: { id: userId } } },
            relations: { subscription: true },
            order: { paymentDate: 'DESC' },
        });

        if (!payments || payments.length === 0) {
            throw new NotFoundException(`No payments found for user ${userId}`);
        }
        return payments;
    }

    /** 🚀 NUEVO: Crear una suscripción con MercadoPago */
    async createSubscription(subscriptionId: number, planName: string, frequency: number, amount: number) {
        const subscription = await this.subscriptionsRepo.findOne({
            where: { id: subscriptionId },
        });
        if (!subscription) {
            throw new NotFoundException(`Subscription ${subscriptionId} not found`);
        }

        // Llamar a MP
        const mpResponse = await this.mercadoPagoService.createSubscription(planName, frequency, amount);

        // Guardar el pago inicial como PENDING
        const payment = this.paymentsRepo.create({
            subscription,
            status: PaymentStatus.PENDING,
            externalId: mpResponse.id, // ID de la suscripción en MP
            amount,
        });

        await this.paymentsRepo.save(payment);

        return {
            mpResponse,
            payment,
        };
    }
}
