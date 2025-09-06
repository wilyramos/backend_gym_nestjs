import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { GatewaysModule } from 'src/gateways/gateways.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Subscription]),
    GatewaysModule
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule { }
