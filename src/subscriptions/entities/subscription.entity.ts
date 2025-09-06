// src/subscriptions/entities/subscription.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Membership } from '../../memberships/entities/membership.entity';
import { PaymentGateway } from '../../payments/enums/payment-gateway.enum';

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    PAST_DUE = 'PAST_DUE',
    CANCELED = 'CANCELED',
    EXPIRED = 'EXPIRED',
}

export enum SubscriptionPlan {
    MONTHLY = 'MONTHLY',
    TRIMESTRAL = 'TRIMESTRAL',
    YEARLY = 'YEARLY',
    PREMIUM = 'PREMIUM',
}

@Entity()
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.subscriptions, { eager: false })
    user: User;

    @Column({
        type: 'enum',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.MONTHLY,
    })
    plan: SubscriptionPlan;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE,
    })
    status: SubscriptionStatus;

    @CreateDateColumn()
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: PaymentGateway,
        default: PaymentGateway.MERCADOPAGO,
    })
    gateway: PaymentGateway;

    @Column({ nullable: true })
    gatewayPlanId: string; // ID del plan en la pasarela

    @Column({ nullable: true })
    gatewayCustomerId: string; // ID del cliente/payer en la pasarela

    @Index() // para búsquedas rápidas
    @Column({ nullable: true })
    externalId: string; // id de la suscripción en la pasarela

    // Relations
    @OneToMany(() => Payment, (p) => p.subscription)
    payments: Payment[];

    @OneToOne(() => Membership, (m) => m.subscription, { cascade: true })
    @JoinColumn()
    membership: Membership;
}
