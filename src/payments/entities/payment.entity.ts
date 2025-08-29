import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Membership } from '../../memberships/entities/membership.entity';

export enum PaymentMethod {
    ONLINE = 'ONLINE',
    CASH = 'CASH',
    ADMIN = 'ADMIN', // Pago asignado por administrador
}

export enum PaymentStatus {
    PENDING = 'PENDING',       // Pago creado pero no confirmado
    APPROVED = 'APPROVED',     // Pago confirmado exitosamente
    FAILED = 'FAILED',         // Pago rechazado
    CANCELLED = 'CANCELLED',   // Pago cancelado por usuario o admin
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: PaymentMethod })
    method: PaymentMethod;

    @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Column({ type: 'varchar', nullable: true })
    transactionId?: string;

    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;
    // información adicional del pago (e.g., respuesta del gateway)

    @CreateDateColumn()
    createdAt: Date;


    // Relations
    @ManyToOne(() => User, user => user.payments)
    user: User;

    @OneToOne(() => Membership, membership => membership.payment)
    membership: Membership;

}
