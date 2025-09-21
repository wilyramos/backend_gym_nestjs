import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Membership } from '../../memberships/entities/membership.entity';

export enum UserRole {
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
    TRAINER = 'TRAINER',
}

export enum AuthProvider {
    LOCAL = 'LOCAL',
    GOOGLE = 'GOOGLE',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ type: 'varchar', length: 100, nullable: true, select: false })
    password: string | null;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    role: UserRole;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    document: string | null;

    // Google

    @Column({
        type: 'enum',
        enum: AuthProvider,
        default: AuthProvider.LOCAL,
    })
    provider: AuthProvider;

    @Column({ type: 'varchar', nullable: true, unique: true })
    googleId: string | null;

    // Relations
    @OneToMany(() => Subscription, (sub) => sub.user)
    subscriptions: Subscription[];

    @OneToMany(() => Membership, (m) => m.user)
    memberships: Membership[];
}
