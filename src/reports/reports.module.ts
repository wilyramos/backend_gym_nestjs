import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from '../memberships/entities/membership.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Membership, Subscription, Payment])
    ],
    providers: [ReportsService],
    controllers: [ReportsController]
})
export class ReportsModule { }