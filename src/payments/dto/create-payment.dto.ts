import { IsNotEmpty } from "class-validator";
import { PaymentMethod } from "../entities/payment.entity";
import { PaymentStatus } from "../entities/payment.entity";

export class CreatePaymentDto {
    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    membershipId?: number;

    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    method: PaymentMethod;   // ONLINE | CASH | ADMIN


    status?: PaymentStatus;  // PENDING | APPROVED | etc.
    transactionId?: string;
    metadata?: Record<string, any>;
}