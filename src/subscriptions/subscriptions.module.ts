import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { UsersModule } from 'src/users/users.module';
import { MembershipsModule } from 'src/memberships/memberships.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { User } from 'src/users/entities/user.entity';
import { Membership } from 'src/memberships/entities/membership.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, User, Membership]),
 
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [TypeOrmModule, SubscriptionsService]
})
export class SubscriptionsModule {}