import { Injectable, Logger } from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(private readonly paymentsService: PaymentsService) { }

    async handleMercadoPagoEvent(payload: any, signature?: string) {
        this.logger.log(`Webhook MercadoPago recibido: ${JSON.stringify(payload)}`);
        // 🔹 Aquí delegarías al paymentsService para actualizar el pago
        // Ejemplo:
        // await this.paymentsService.updateStatusFromMercadoPago(payload);
        console.log('Payload MercadoPago    :', payload);
        return { received: true };
    }

    async handlePayPalEvent(payload: any, transmissionId?: string) {
        this.logger.log(`Webhook PayPal recibido: ${JSON.stringify(payload)}`);
        // 🔹 Delegar a paymentsService
        // await this.paymentsService.updateStatusFromPayPal(payload);
        return { received: true };
    }
}
