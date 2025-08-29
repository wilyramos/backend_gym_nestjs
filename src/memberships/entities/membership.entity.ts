import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum MembershipStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
}

export enum MembershipType {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    ANNUAL = 'ANNUAL',
}

@Entity('memberships')
export class Membership {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: MembershipType })
    type: MembershipType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'timestamp', nullable: true })
    startDate?: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate?: Date;

    @Column({ type: 'enum', enum: MembershipStatus, default: MembershipStatus.PENDING })
    status: MembershipStatus;

    @ManyToOne(() => User, user => user.memberships)
    user: User;

    @OneToOne(() => Payment, payment => payment.membership, { cascade: true, nullable: true })
    @JoinColumn()
    payment?: Payment;

    @CreateDateColumn()
    createdAt: Date;
}