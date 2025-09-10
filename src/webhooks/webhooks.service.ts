// src/webhooks/webhooks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { MembershipsService } from '../memberships/memberships.service';
import { MercadoPagoPaymentsService } from '../payments/mercadopago-payments.service';
import { PaymentStatus } from 'src/payments/entities/payment.entity';

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
        this.logger.log(`📩 Webhook MercadoPago recibido: ${JSON.stringify(payload)}`);

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
                    this.logger.warn(`⚠️ Evento no manejado: ${type}`);
            }
        } catch (error) {
            this.logger.error(`❌ Error manejando webhook: ${error.message}`, error.stack);
        }
    }

    private async handleAuthorizedPayment(authorizedPaymentId: string) {
        this.logger.log(`🔎 Consultando authorized_payment id=${authorizedPaymentId}`);

        const paymentData = await this.mercadoPagoPaymentsService.getAuthorizedPayment(
            authorizedPaymentId,
        );
        this.logger.debug(`📊 Detalle authorized_payment: ${JSON.stringify(paymentData)}`);

        const subscriptionId = Number(paymentData.external_reference); // lo mandaste al crear preapproval
        const status = paymentData.payment?.status || paymentData.status;
        const amount = paymentData.transaction_amount;
        const gatewayPaymentId = paymentData.payment?.id?.toString();

        // 1️⃣ Buscar la suscripción asociada
        const subscription = await this.subscriptionsService.findById(subscriptionId);
        if (!subscription) {
            this.logger.error(`❌ No se encontró la suscripción con id=${subscriptionId}`);
            return;
        }

        // 2️⃣ Buscar si ya existe el pago
        let payment = await this.paymentsService.findByGatewayPaymentId(gatewayPaymentId);

        if (!payment) {
            this.logger.log(
                `🆕 Creando pago subscriptionId=${subscription.id}, mpPaymentId=${gatewayPaymentId}`,
            );

            payment = await this.paymentsService.createPayment(subscription.id, {
                amount,
                status: this.mapStatus(status),
                externalId: gatewayPaymentId,
            });
        } else {
            this.logger.log(`🔄 Actualizando estado pago mpPaymentId=${gatewayPaymentId}`);
            await this.paymentsService.updateStatusByExternalId(
                gatewayPaymentId,
                this.mapStatus(status),
            );
        }

        // 3️⃣ Si aprobado → activar/renovar membresía
        if (status === 'approved' || status === 'processed') {
            await this.membershipsService.createOrUpdateMembership({
                userId: subscription.user.id,
                subscriptionId: subscription.id,
                durationInDays: this.getPlanDuration(subscription.plan),
            });

            this.logger.log(
                `✅ Membresía activada/renovada para userId=${subscription.user.id}, plan=${subscription.plan}`,
            );
        }
    }

    private async handleSubscriptionUpdate(preapprovalId: string) {
        this.logger.log(`🔎 Consultando preapproval id=${preapprovalId}`);

        const subData = await this.mercadoPagoPaymentsService.getPreapproval(preapprovalId);
        this.logger.debug(`📊 Detalle preapproval: ${JSON.stringify(subData)}`);

        const subscriptionId = Number(subData.external_reference);
        const status = subData.status; // authorized, paused, cancelled, etc.

        // Actualizar estado local de la suscripción
        await this.subscriptionsService.updateStatusById(subscriptionId, status);

        this.logger.log(`🔄 Suscripción ${subscriptionId} actualizada → status=${status}`);
    }

    private mapStatus(mpStatus: string): PaymentStatus {
        switch (mpStatus) {
            case 'processed':
            case 'approved':
                return PaymentStatus.APPROVED;
            case 'cancelled':
            case 'rejected':
                return PaymentStatus.FAILED;
            case 'pending':
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