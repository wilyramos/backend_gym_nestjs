import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership, MembershipStatus } from './entities/membership.entity';

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
            relations: ['user', 'subscription'], // traemos relaciones si hace falta
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
}