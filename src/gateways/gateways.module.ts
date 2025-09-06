import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago/mercadopago.service';

@Module({
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class GatewaysModule {}
