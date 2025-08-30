import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

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

    @ManyToOne(() => Subscription, (s) => s.payments, { onDelete: 'CASCADE', eager: true })
    subscription: Subscription;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ default: 'USD' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod,
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

    @Column({ nullable: true })
    externalId: string; // id del pago en la pasarela
}
