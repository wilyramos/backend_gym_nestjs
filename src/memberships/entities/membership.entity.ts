
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.memberships)
  user: User;

  @Column({ type: 'varchar' })
  type: string; // mensual, trimestral, anual

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'enum', enum: ['ACTIVE','EXPIRED','CANCELLED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

  @OneToMany(() => Payment, payment => payment.membership)
  payments: Payment[];
}

