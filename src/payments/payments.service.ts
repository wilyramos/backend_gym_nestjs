import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
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
        const { userId, membershipId, method, ...paymentData } = createPaymentDto;

        // Verificar usuario
        const user = await this.usersService.findOne(userId);
        if (!user) throw new NotFoundException('User not found');

        // Determinar status: admin o CASH -> APPROVED, else PENDING
        const status = method === PaymentMethod.ADMIN || method === PaymentMethod.CASH
            ? PaymentStatus.APPROVED
            : PaymentStatus.PENDING;

        // Crear pago
        const payment = this.paymentRepository.create({
            ...paymentData,
            user,
            method,
            status,
        });

        // Asociar membresía si se pasó membershipId
        if (membershipId) {
            const membership = await this.membershipsService.findOne(membershipId);
            if (!membership) throw new NotFoundException('Membership not found');

            payment.membership = membership;

            if (status === PaymentStatus.APPROVED) {
                await this.membershipsService.activateMembership(membership);
            }

            // Actualizar la referencia inversa para la respuesta
            membership.payment = payment;
        }

        // Guardar pago y retornar
        return this.paymentRepository.save(payment);
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