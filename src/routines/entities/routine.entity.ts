
// Routine: 

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Entity('routines')
export class Routine {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    // Cliente que recibe la rutina
    @ManyToOne(() => User, user => user.routines)
    client: User;

    // Trainer que crea la rutina
    @ManyToOne(() => User, user => user.createdRoutines)
    trainer: User;

    @ManyToMany(() => Exercise, exercise => exercise.routines, { eager: true })
    @JoinTable({
        name: 'routine_exercises',
        joinColumn: { name: 'routine_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'exercise_id', referencedColumnName: 'id' },
    })
    exercises: Exercise[];
}
