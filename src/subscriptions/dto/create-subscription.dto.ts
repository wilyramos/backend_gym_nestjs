import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { SubscriptionPlan } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsEnum(SubscriptionPlan)
  @IsNotEmpty()
  plan: SubscriptionPlan;

  @IsString()
  @IsOptional()
  externalId?: string;
}
