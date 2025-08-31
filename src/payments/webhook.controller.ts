import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments/webhook')
export class WebhooksController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Endpoint para recibir notificaciones de la pasarela
   * Puede ser POST /payments/webhook
   */
  @Post()
  @HttpCode(HttpStatus.OK) // Siempre responde 200 para que la pasarela sepa que recibimos
  async handleWebhook(
    @Body() body: any,
    @Headers('x-signature') signature: string, // ejemplo si la pasarela firma el payload
  ) {
    // 1. Validar la firma si la pasarela la envía
    // 2. Analizar el tipo de evento
    const { event, data } = body;

    switch (event) {
      case 'payment.created':
        // Crear pago pendiente en tu DB
        await this.paymentsService.createPayment(data.subscriptionId, {
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          externalId: data.externalId,
        });
        break;

      case 'payment.completed':
        // Marcar pago como aprobado
        await this.paymentsService.confirmPayment(data.paymentId, data.externalId);
        break;

      case 'payment.failed':
        await this.paymentsService.failPayment(data.paymentId);
        break;

      case 'payment.refunded':
        await this.paymentsService.refundPayment(data.paymentId);
        break;

      default:
        console.log('Evento no manejado:', event);
    }

    return { received: true }; // respuesta obligatoria para muchas pasarelas
  }
}
