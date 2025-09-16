// src/payments/payments.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { MercadoPagoService } from '../gateways/mercadopago/mercadopago.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);

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
            status: data.status || PaymentStatus.PENDING,
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

    /** Crear una suscripción con MercadoPago */
    async activateSubscriptionInGateway(subscriptionId: number) {

        const subscription = await this.subscriptionsRepo.findOne({
            where: { id: subscriptionId },
            relations: ['user'],
        });

        console.log("Subscription encontrada:", subscription);

        if (!subscription) {
            throw new NotFoundException(`Subscription ${subscriptionId} not found`);
        }

        let frequency: number;
        let amount: number;

        // Determinar frecuencia y monto según el plan
        switch (subscription.plan) {
            case 'MONTHLY':
                frequency = 1;
                amount = 80;
                break;
            case 'TRIMESTRAL':
                frequency = 3;
                amount = 160;
                break;
            case 'YEARLY':
                frequency = 12;
                amount = 450;
                break;
            default:
                throw new NotFoundException(`Plan ${subscription.plan} not recognized`);
        }

        // Llamar a MP
        const mpResponse = await this.mercadoPagoService.createSubscription(subscription.plan, frequency, amount, subscription.user.email, subscription.id);

        subscription.externalId = mpResponse.id; // Guardar el ID de la suscripción de MP
        await this.subscriptionsRepo.save(subscription);

        // Guardar el pago inicial como PENDING
        // const payment = this.paymentsRepo.create({
        //     subscription,
        //     status: PaymentStatus.PENDING,
        //     // externalId: 
        //     amount,
        // });

        // await this.paymentsRepo.save(payment);

        return {
            mpResponse,
            // payment,
        };
    }


    async updateStatusByExternalId(externalId: string, status: PaymentStatus) {
        const payment = await this.paymentsRepo.findOne({ where: { externalId } });

        if (!payment) {
            // No existe → no lanzamos excepción, solo loggeamos
            this.logger?.warn?.(`Payment con externalId=${externalId} no encontrado para actualizar`);
            return null;
        }

        payment.status = status;
        return this.paymentsRepo.save(payment);
    }

    async findByGatewayPaymentId(externalId: string): Promise<Payment | null> {
        console.log("Buscando pago con externalId:", externalId);
        return this.paymentsRepo.findOne({ where: { externalId } }) ?? null;
    }

}