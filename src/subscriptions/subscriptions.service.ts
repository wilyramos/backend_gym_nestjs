import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    Subscription,
    SubscriptionPlan,
    SubscriptionStatus,
} from './entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { Membership, MembershipStatus } from '../memberships/entities/membership.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionResponseDto } from './dto/response-subscription.dto';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionsRepo: Repository<Subscription>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(Membership)
        private readonly membershipsRepo: Repository<Membership>,
    ) { }

    /** -------------------
     * Crear una suscripción
     * ------------------- */
    async create(dto: CreateSubscriptionDto, userId: number) {
        // Validar que el usuario exista
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User with id ${userId} not found`);

        // Evitar suscripciones duplicadas activas
        const existing = await this.subscriptionsRepo.findOne({
            where: { user: { id: user.id }, status: SubscriptionStatus.ACTIVE },
        });
        if (existing) {
            throw new ConflictException(`User ${user.id} already has an active subscription`);
        }

        // Crear suscripción
        const subscription = this.subscriptionsRepo.create({
            user: user,
            plan: dto.plan,
            status: SubscriptionStatus.PENDING,
            externalId: dto.externalId ?? undefined,
        });

        const saved = await this.subscriptionsRepo.save(subscription);
        return {
            ...saved,
            userId: saved.user.id,
        };
    }

    /** -------------------
     * Listar todas las suscripciones
     * ------------------- */
    async findAll() {
        return this.subscriptionsRepo.find()
    }

    /** -------------------
     * Buscar suscripción por ID
     * ------------------- */
    async findOne(id: number): Promise<Subscription> {
        const subscription = await this.subscriptionsRepo.findOne({
            where: { id },
            relations: ['user', 'payments', 'membership'],
        });

        if (!subscription) {
            throw new NotFoundException(`Subscription with id ${id} not found`);
        }
        return subscription;
    }

    /** -------------------
     * Actualizar suscripción
     * ------------------- */
    async update(id: number, dto: UpdateSubscriptionDto) {
        const subscription = await this.findOne(id);

        if (dto.plan) {
            subscription.plan = dto.plan;
            // recalcular fecha fin si se cambia plan
            if (subscription.membership) {
                subscription.membership.validTo = this.calculateEndDate(
                    subscription.membership.validFrom,
                    dto.plan,
                );
            }
        }

        if (dto.status) {
            subscription.status = dto.status;

            // sincronizar estado con membership
            if (subscription.membership) {
                if (dto.status === SubscriptionStatus.CANCELED) {
                    subscription.membership.status = MembershipStatus.PAUSED;
                }
                if (dto.status === SubscriptionStatus.EXPIRED) {
                    subscription.membership.status = MembershipStatus.EXPIRED;
                }
            }
        }

        Object.assign(subscription, dto);
        return this.subscriptionsRepo.save(subscription);
    }

    /** -------------------
     * Eliminar suscripción
     * ------------------- */
    async remove(id: number) {
        const subscription = await this.findOne(id);
        return this.subscriptionsRepo.remove(subscription);
    }

    /** -------------------
     * Helpers
     * ------------------- */
    private calculateEndDate(startDate: Date, plan: SubscriptionPlan): Date {

        console.log("starttt y plan", startDate, plan);
        const endDate = new Date(startDate);
        if (plan === SubscriptionPlan.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
        } else if (plan === SubscriptionPlan.YEARLY) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else if (plan === SubscriptionPlan.PREMIUM) {
            endDate.setFullYear(endDate.getFullYear() + 2);
        }

        console.log("end", endDate);
        return endDate;
    }
}
