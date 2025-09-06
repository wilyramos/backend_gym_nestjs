// src/memberships/entities/membership.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum MembershipStatus {
    ACTIVE = 'ACTIVE',
    PAUSED = 'PAUSED',
    EXPIRED = 'EXPIRED',
}

@Entity()
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (u) => u.memberships, { eager: false })
    user: User;

    @OneToOne(() => Subscription, (s) => s.membership)
    subscription: Subscription;

    @Column({
        type: 'enum',
        enum: MembershipStatus,
        default: MembershipStatus.ACTIVE,
    })
    status: MembershipStatus;

    @Column({ type: 'timestamp' })
    validFrom: Date;

    @Column({ type: 'timestamp' })
    validTo: Date;
}
