
// Payment

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membership } from '../../memberships/entities/membership.entity';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.payments, { eager: true })
    user: User;

    @ManyToOne(() => Membership, membership => membership.payments, { eager: true, nullable: true })
    membership?: Membership;

    @Column({ type: 'decimal' })
    amount: number;

    @Column({ type: 'enum', enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
    status: 'PENDING' | 'COMPLETED' | 'FAILED';

    @Column({ type: 'varchar', default: 'MERCADOPAGO' })
    method: string; // "MERCADOPAGO" o "PRESENCIAL"

    @Column({ type: 'varchar', nullable: true })
    transactionId?: string;

    @CreateDateColumn()
    createdAt: Date;
}


