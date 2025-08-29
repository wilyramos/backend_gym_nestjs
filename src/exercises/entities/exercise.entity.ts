// Excercise

import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Routine } from '../../routines/entities/routine.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true })
  image?: string;

  @Column({ type: 'enum', enum: ['STRENGTH','CARDIO','FLEXIBILITY'], default: 'STRENGTH' })
  type: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY';

  @ManyToMany(() => Routine, routine => routine.exercises)
  routines: Routine[];
}
