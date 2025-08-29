import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Routine } from '../../routines/entities/routine.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'varchar', length: 8, nullable: true, unique: true })
    dni?: string;

    @Column({ type: 'enum', enum: ['CLIENT', 'TRAINER', 'ADMIN'], default: 'CLIENT' })
    role: 'CLIENT' | 'TRAINER' | 'ADMIN';

    @Column({ type: 'varchar', nullable: true })
    phone?: string;

    // Historial de membresías
    @OneToMany(() => Membership, membership => membership.user)
    memberships: Membership[];

    // Pagos realizados
    @OneToMany(() => Payment, payment => payment.user)
    payments: Payment[];

    // Rutinas asignadas (solo clientes)
    @OneToMany(() => Routine, routine => routine.client)
    routines: Routine[];

    // Rutinas creadas por trainer
    @OneToMany(() => Routine, routine => routine.trainer)
    createdRoutines: Routine[];
}
