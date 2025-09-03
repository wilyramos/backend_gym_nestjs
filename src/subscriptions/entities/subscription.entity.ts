import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Membership } from '../../memberships/entities/membership.entity';

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

    @Column({ nullable: true })
    externalId: string; // id en la pasarela (Stripe/MercadoPago)

    // Relations
    @OneToMany(() => Payment, (p) => p.subscription)
    payments: Payment[];

    @OneToOne(() => Membership, (m) => m.subscription, { cascade: true })
    @JoinColumn()
    membership: Membership;
}
