// src/subscriptions/dto/update-subscription.dto.ts
import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '../entities/subscription.entity';

export class UpdateSubscriptionDto {
    @IsEnum(SubscriptionPlan)
    @IsOptional()
    plan?: SubscriptionPlan;

    @IsEnum(SubscriptionStatus)
    @IsOptional()
    status?: SubscriptionStatus;

    @IsDate()
    @IsOptional()
    endDate?: Date;

    @IsString()
    @IsOptional()
    externalId?: string;
}
