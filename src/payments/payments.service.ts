import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class PaymentsService {

    constructor(
        @InjectRepository(Payment)
        private paymentRepository: Repository<Payment>,

        private usersService: UsersService,
        private membershipsService: MembershipsService

    ) { }

    async create(createPaymentDto: CreatePaymentDto) {



        return `This action adds a new payment`;
    }

    findAll() {
        return `This action returns all payments`;
    }

    findOne(id: number) {



    }

    update(id: number, updatePaymentDto: UpdatePaymentDto) {
        return `This action updates a #${id} payment`;
    }

    remove(id: number) {
        return `This action removes a #${id} payment`;
    }
}