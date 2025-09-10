import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { PaymentsModule } from '../payments/payments.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    PaymentsModule,
    SubscriptionsModule,
    MembershipsModule
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService]
})
export class WebhooksModule { }