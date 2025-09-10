import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership, MembershipStatus } from './entities/membership.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { addDays } from 'date-fns';

@Injectable()
export class MembershipsService {
    constructor(
        @InjectRepository(Membership)
        private membershipsRepo: Repository<Membership>,
    ) { }

    async create(data: Partial<Membership>) {
        const membership = this.membershipsRepo.create(data);
        return await this.membershipsRepo.save(membership);
    }

    async findAll() {
        return await this.membershipsRepo.find({
            relations: ['user', 'subscription'],
        });
    }

    async findOne(id: number) {
        const membership = await this.membershipsRepo.findOne({
            where: { id },
            relations: ['user', 'subscription'],
        });

        if (!membership) {
            throw new NotFoundException(`Membership ${id} not found`);
        }
        return membership;
    }

    async findByUser(userId: number) {
        return await this.membershipsRepo.find({
            where: { user: { id: userId } },
            relations: ['subscription'],
        });
    }

    async updateStatus(id: number, status: MembershipStatus) {
        const membership = await this.findOne(id);
        membership.status = status;
        return await this.membershipsRepo.save(membership);
    }

    async activateMembership(id: number) {
        return this.updateStatus(id, MembershipStatus.ACTIVE);
    }

    /**
     * Crear o renovar membresía para un usuario a partir de una suscripción
     */
    async createOrUpdateMembership({
        userId,
        subscriptionId,
        durationInDays,
    }: {
        userId: number;
        subscriptionId: number;
        durationInDays: number;
    }) {
        const now = new Date();

        let membership = await this.membershipsRepo.findOne({
            where: { user: { id: userId }, subscription: { id: subscriptionId } },
            relations: ['subscription'],
        });

        if (membership) {
            const baseDate = membership.validTo > now ? membership.validTo : now;
            membership.validTo = addDays(baseDate, durationInDays);
            membership.status = MembershipStatus.ACTIVE;
        } else {
            membership = this.membershipsRepo.create({
                user: { id: userId } as any,
                subscription: { id: subscriptionId } as any,
                status: MembershipStatus.ACTIVE,
                validFrom: now,
                validTo: addDays(now, durationInDays),
            });
        }

        return await this.membershipsRepo.save(membership);
    }
}