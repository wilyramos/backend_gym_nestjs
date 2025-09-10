import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { User } from 'src/users/entities/user.entity';
import { Membership } from 'src/memberships/entities/membership.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Subscription, User, Membership]),
 
    ],
    controllers: [SubscriptionsController],
    providers: [SubscriptionsService],
    exports: [SubscriptionsService]
})
export class SubscriptionsModule {}