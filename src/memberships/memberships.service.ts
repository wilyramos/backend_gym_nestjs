// src/memberships/memberships.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership, MembershipStatus } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { QueryMembershipsDto } from './dto/query-memberships.dto';
import { User } from '../users/entities/user.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Injectable()
export class MembershipsService {
    constructor(
        @InjectRepository(Membership)
        private readonly membershipsRepository: Repository<Membership>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        @InjectRepository(Subscription)
        private readonly subscriptionsRepository: Repository<Subscription>,
    ) { }

    async create(dto: CreateMembershipDto): Promise<Membership> {
        const user = await this.usersRepository.findOne({
            where: { id: dto.userId },
        });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        const subscription = await this.subscriptionsRepository.findOne({
            where: { id: dto.subscriptionId },
        });
        if (!subscription) throw new NotFoundException('Suscripción no encontrada');

        const existingActive = await this.membershipsRepository.findOne({
            where: { user: { id: dto.userId }, status: MembershipStatus.ACTIVE },
        });
        if (existingActive) {
            throw new ConflictException(
                'El usuario ya tiene una membresía activa',
            );
        }

        const membership = this.membershipsRepository.create({
            user,
            subscription,
            status: dto.status ?? MembershipStatus.ACTIVE,
            validFrom: dto.validFrom,
            validTo: dto.validTo,
        });

        return await this.membershipsRepository.save(membership);
    }

    async findAll(query: QueryMembershipsDto) {
        const { page = 1, limit = 10, status, search } = query;

        const qb = this.membershipsRepository
            .createQueryBuilder('membership')
            .leftJoinAndSelect('membership.user', 'user')
            .leftJoinAndSelect('membership.subscription', 'subscription')
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('membership.id', 'DESC');

        if (status) {
            qb.andWhere('membership.status = :status', { status });
        }

        if (search) {
            qb.andWhere(
                '(user.name ILIKE :search OR user.email ILIKE :search)',
                { search: `%${search}%` },
            );
        }

        const [data, total] = await qb.getManyAndCount();

        return { data, total, page, limit };
    }

    async findOne(id: number): Promise<Membership> {
        const membership = await this.membershipsRepository.findOne({
            where: { id },
            relations: ['user', 'subscription'],
        });

        if (!membership)
            throw new NotFoundException(`Membresía con id ${id} no encontrada`);

        return membership;
    }

    async update(id: number, dto: UpdateMembershipDto): Promise<Membership> {
        const membership = await this.findOne(id);

        Object.assign(membership, dto);
        return await this.membershipsRepository.save(membership);
    }

    async remove(id: number): Promise<{ message: string }> {
        const membership = await this.findOne(id);
        await this.membershipsRepository.remove(membership);
        return { message: `Membresía con id ${id} eliminada` };
    }
}
