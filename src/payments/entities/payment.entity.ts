// src/payments/entities/payment.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { PaymentGateway } from '../../payments/enums/payment-gateway.enum';

export enum PaymentMethod {
    CARD = 'CARD',
    CASH = 'CASH',
    PAYPAL = 'PAYPAL',
    ADMIN = 'ADMIN',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Subscription, (s) => s.payments, { onDelete: 'CASCADE' })
    subscription: Subscription;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'PEN' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CARD,
    })
    method: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @CreateDateColumn()
    paymentDate: Date;

    @Index()
    @Column({ nullable: true })
    externalId: string; // id del pago en la pasarela

    @Column({
        type: 'enum',
        enum: PaymentGateway,
        default: PaymentGateway.MERCADOPAGO,
    })
    gateway: PaymentGateway;

    @Column({ default: 1 })
    attempt: number; // número de intento de cobro
}