import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('mercadopago')
    async handleMercadoPagoWebhook(
        @Body() body: any,
        // @Headers('x-signature') signature: string,
        @Req() req: any,
    ) {
        console.log('Body:', body);

        //TODO: validacion de la firma del webhook
        return this.webhooksService.handleMercadoPagoEvent(body);
    }
}
