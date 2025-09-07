// create-subscription.dto.ts
import { IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  plan: SubscriptionPlan;

  @IsString()
  @IsOptional()
  externalId?: string;
}
