import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    // Ejemplo: Mercado Pago -> POST /webhooks/mercadopago
    @Post('mercadopago')
    async handleMercadoPagoWebhook(
        @Body() body: any,
        @Headers('x-signature') signature: string, // opcional, para validar
        @Req() req: Request,
    ) {
        // Solo delegamos, la lógica va en el servicio
        return this.webhooksService.handleMercadoPagoEvent(body, signature);
    }

    // Ejemplo: PayPal -> POST /webhooks/paypal
    @Post('paypal')
    async handlePayPalWebhook(
        @Body() body: any,
        @Headers('paypal-transmission-id') transmissionId: string, // opcional
    ) {
        return this.webhooksService.handlePayPalEvent(body, transmissionId);
    }
}