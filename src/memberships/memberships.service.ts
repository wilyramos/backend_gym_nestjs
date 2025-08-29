import { Injectable } from '@nestjs/common';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership, MembershipStatus } from './entities/membership.entity';
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
      throw new Error('User not found');
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
      if (!payment) {
        throw new Error('Payment not found');
      }
      membership.payment = payment;
    }

    return this.membershipRepository.save(membership);
  }

  findAll() {
    return `This action returns all memberships`;
  }

  async findOne(id: number) {

    const membership = await this.membershipRepository.findOne({
      where: { id },
    });
    if (!membership) throw new Error('Membership not found');
    return membership;
  }

  update(id: number, updateMembershipDto: UpdateMembershipDto) {
    return `This action updates a #${id} membership`;
  }

  remove(id: number) {
    return `This action removes a #${id} membership`;
  }
}