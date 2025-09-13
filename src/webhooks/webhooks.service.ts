// src/webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MembershipsService } from '../memberships/memberships.service';
import { MercadoPagoPaymentsService } from '../payments/mercadopago-payments.service';
import { PaymentStatus } from 'src/payments/entities/payment.entity';
import { SubscriptionStatus } from 'src/subscriptions/entities/subscription.entity';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly membershipsService: MembershipsService,
        private readonly mercadoPagoPaymentsService: MercadoPagoPaymentsService,
    ) { }

    async handleMercadoPagoEvent(payload: any) {
        this.logger.log(`Webhook MercadoPago recibido: ${JSON.stringify(payload)}`);

        try {
            const { type, action, data } = payload;

            switch (type) {
                case 'subscription_authorized_payment':
                    if (action === 'created') {
                        await this.handleAuthorizedPayment(data.id);
                    }
                    break;

                case 'preapproval':
                    await this.handleSubscriptionUpdate(data.id);
                    break;

                default:
                    this.logger.warn(`Evento no manejado: ${type}`);
            }
        } catch (error) {
            this.logger.error(`Error manejando webhook: ${error.message}`, error.stack);
        }
    }

    private async handleAuthorizedPayment(authorizedPaymentId: string) {

        const paymentData = await this.mercadoPagoPaymentsService.getAuthorizedPayment(
            authorizedPaymentId,
        );
        const subscriptionId = Number(paymentData.external_reference);
        const mpPaymentId = paymentData.payment?.id?.toString();
        this.logger.debug(`Detalle pago autorizado: ${JSON.stringify(paymentData)}`);
        const status = paymentData.payment?.status || paymentData.status;
        const amount = paymentData.transaction_amount;

        // Buscar la suscripción asociada
        const subscription = await this.subscriptionsService.findById(subscriptionId);
        if (!subscription) {
            this.logger.error(`No se encontró la suscripción con id=${subscriptionId}`);
            return;
        }

        // Registrar o actualizar el pago
        let payment = await this.paymentsService.findByGatewayPaymentId(mpPaymentId);

        if (!payment) {
            this.logger.log(
                `Creando pago subscriptionId=${subscription.id}, mpPaymentId=${mpPaymentId}`,
            );

            payment = await this.paymentsService.createPayment(subscription.id, {
                amount,
                status: this.mapStatus(status),
                externalId: mpPaymentId,
            });
        } else {
            this.logger.log(`Actualizando estado pago mpPaymentId=${mpPaymentId}`);
            await this.paymentsService.updateStatusByExternalId(
                mpPaymentId,
                this.mapStatus(status),
            );
        }

        // Si aprobado → activar/renovar membresía
        if (status === 'approved' || status === 'processed') {

            // Actualizar estado suscripción si estaba pausada o cancelada
            await this.subscriptionsService.update(subscription.id, {
                status: SubscriptionStatus.ACTIVE,
                plan: subscription.plan,
            });

            await this.membershipsService.createOrUpdateMembership({
                userId: subscription.user.id,
                subscriptionId: subscription.id,
                durationInDays: this.getPlanDuration(subscription.plan),
            });

            this.logger.log(
                `Membresía activada/renovada para userId=${subscription.user.id}, plan=${subscription.plan}`,
            );
        }
    }

    private async handleSubscriptionUpdate(preapprovalId: string) {
        this.logger.log(`Consultando preapproval id=${preapprovalId}`);

        const subData = await this.mercadoPagoPaymentsService.getPreapproval(preapprovalId);
        this.logger.debug(`Detalle preapproval: ${JSON.stringify(subData)}`);

        const subscriptionId = Number(subData.external_reference);
        const status = subData.status; // authorized, paused, cancelled, etc.

        // Actualizar estado local de la suscripción
        await this.subscriptionsService.updateStatusById(subscriptionId, status);

        this.logger.log(`Suscripción ${subscriptionId} actualizada → status=${status}`);
    }



    private mapStatus(mpStatus: string): PaymentStatus {
        switch (mpStatus) {
            case 'approved':
            case 'accredited':
                return PaymentStatus.APPROVED;

            case 'pending':
            case 'in_process':
            case 'in_mediation':
                return PaymentStatus.PENDING;

            case 'cancelled':
            case 'rejected':
            case 'refused':
                return PaymentStatus.FAILED;

            case 'refunded':
            case 'charged_back':
                return PaymentStatus.REFUNDED;
            default:
                return PaymentStatus.PENDING;
        }
    }

    private getPlanDuration(plan: string): number {
        switch (plan) {
            case 'MONTHLY':
                return 30;
            case 'TRIMESTRAL':
                return 90;
            case 'YEARLY':
                return 365;
            default:
                return 30;
        }
    }
}