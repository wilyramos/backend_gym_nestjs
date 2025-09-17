import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository, Between } from 'typeorm';
import { Membership, MembershipStatus } from '../memberships/entities/membership.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { GetReportsDto } from './dto/get-reports.dto';

@Injectable()
export class ReportsService {

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Membership) private membershipRepository: Repository<Membership>,
        @InjectRepository(Subscription) private subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Payment) private paymentRepository: Repository<Payment>,
    ) { }

    async getDashboardMetrics({ startDate, endDate }: GetReportsDto) {
        // Conversión y valores por defecto
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();

        // Usuarios activos
        const activeUsers = await this.membershipRepository.count({
            where: { status: MembershipStatus.ACTIVE },
        });

        // Membresías por vencer en los próximos 7 días
        const now = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 7);
        const expiringMemberships = await this.membershipRepository.count({
            where: { validTo: Between(now, nextWeek) },
        });

        // Ingresos en el rango de fechas
        const totalIncome = await this.paymentRepository
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'sum')
            .where('payment.status = :status', { status: PaymentStatus.APPROVED })
            .andWhere('payment.paymentDate BETWEEN :start AND :end', {
                start,
                end,
            })
            .getRawOne()
            .then((result) => parseFloat(result.sum) || 0);

        return {
            activeUsers,
            expiringMemberships,
            totalIncome,
        };
    }
}