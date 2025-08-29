import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership, MembershipStatus, MembershipType } from './entities/membership.entity';
import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { UsersService } from '../users/users.service';


@Injectable()
export class MembershipsService {

    constructor(
        @InjectRepository(Membership)
        private membershipRepository: Repository<Membership>,

        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,

        private usersService: UsersService,

    ) { }


    async create(createMembershipDto: CreateMembershipDto) {

        const { userId, paymentId, ...membershipData } = createMembershipDto;

        const user = await this.usersService.findOne(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create the membership
        const membership = this.membershipRepository.create({
            ...membershipData,
            user,
            status: membershipData.startDate ? MembershipStatus.ACTIVE : MembershipStatus.PENDING,
        });

        // Asoc payment
        if (paymentId) {
            const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
            if (!payment) throw new NotFoundException('Payment not found');

            membership.payment = payment;
        }

        return this.membershipRepository.save(membership);
    }

    findAll() {
        return this.membershipRepository.find({
            relations: ['user', 'payment'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: number) {
        return this.membershipRepository.find({
            where: { user: { id: userId } },
            relations: ['user', 'payment'],
        });
    }

    async findOne(id: number) {

        const membership = await this.membershipRepository.findOne({
            where: { id },
            relations: ['user', 'payment'],
        });
        if (!membership) throw new NotFoundException('Membership not found');
        return membership;
    }

    async update(id: number, updateMembershipDto: UpdateMembershipDto) {
        const membership = await this.findOne(id);

        // Si se quiere actualizar el pago
        if (updateMembershipDto.paymentId) {
            const payment = await this.paymentRepository.findOne({ where: { id: updateMembershipDto.paymentId } });
            if (!payment) throw new NotFoundException('Payment not found');
            membership.payment = payment;
        }

        Object.assign(membership, updateMembershipDto);

        return this.membershipRepository.save(membership);
    }

    remove(id: number) {
        return `This action removes a #${id} membership`;
    }

    // Activate membership

    async activateMembership(membership: Membership) {
        if (!membership) {
            throw new BadRequestException('Membership not found');
        }

        if (membership.status === MembershipStatus.ACTIVE) {
            throw new BadRequestException('Membership is already active');
        }

        // Establecer fechas
        const startDate = new Date();
        const endDate = this.calculateEndDate(startDate, membership.type);

        membership.startDate = startDate;
        membership.endDate = endDate;
        membership.status = MembershipStatus.ACTIVE;

        return this.membershipRepository.save(membership);
    }

    // Calculate days 

    private calculateEndDate(startDate: Date, type: MembershipType): Date {
        const endDate = new Date(startDate);
        switch (type) {
            case MembershipType.MONTHLY:
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case MembershipType.QUARTERLY:
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case MembershipType.ANNUAL:
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            default:
                throw new BadRequestException('Invalid membership type');
        }
        return endDate;
    }
}