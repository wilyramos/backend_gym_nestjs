import {
    Injectable,
    NotFoundException, ConflictException
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
import { MercadoPagoService } from '../gateways/mercadopago/mercadopago.service';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(Subscription)
        private readonly subscriptionsRepo: Repository<Subscription>,

        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,

        @InjectRepository(Membership)
        private readonly membershipsRepo: Repository<Membership>,

        private readonly mercadoPagoService: MercadoPagoService,
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

    async findById(id: number): Promise<Subscription | null> {
        return this.subscriptionsRepo.findOne({
            where: { id },
            relations: ['user', 'payments', 'membership'],
        });
    }

    /** -------------------
     * Actualizar suscripción
     * ------------------- */
    async update(id: number, dto: UpdateSubscriptionDto) {
        const subscription = await this.findOne(id);

        if (dto.plan && subscription.membership) {
            subscription.plan = dto.plan;
            subscription.membership.validTo = this.calculateEndDate(
                subscription.membership.validFrom,
                dto.plan,
            );

            // guarda primero la membership actualizada
            await this.membershipsRepo.save(subscription.membership);
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


    async updateStatusById(id: number, status: SubscriptionStatus) {
        const subscription = await this.findOne(id);
        subscription.status = status;
        return this.subscriptionsRepo.save(subscription);
    }

    /** -------------------
     * Cancelar suscripción
     * ------------------- */

    async cancelSubscriptionByUser(userId: number) {

        const subscription = await this.subscriptionsRepo.findOne({
            where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
            relations: ['user', 'membership'],
        });

        if (!subscription) {
            throw new NotFoundException(`No active subscription found for user ${userId}`);
        }

        subscription.status = SubscriptionStatus.CANCELED;
        if (subscription.membership) {
            subscription.membership.status = MembershipStatus.PAUSED;
            await this.membershipsRepo.save(subscription.membership);
        }

        await this.subscriptionsRepo.save(subscription);

        // Cancelar en el gateway de pago si es posible
        if (subscription.externalId) {
            try {
                await this.mercadoPagoService.cancelSubscription(subscription.externalId);
            } catch (error) {
                console.error(`Failed to cancel subscription in payment gateway: ${error.message}`);
            }
        }

        return { message: 'Subscription canceled successfully' };
    }

    // obtener la suscripcion del usuario

    /** -------------------
     * Obtener suscripción
     * ------------------- */
    async getSubscriptionCardInfo(userId: number) {
        const subscription = await this.subscriptionsRepo.findOne({
            where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
            relations: ['user', 'membership'],
        });

        if (!subscription) {
            throw new NotFoundException(`No active subscription found for user ${userId}`);
        }

        if (!subscription.externalId) {
            return {
                ...subscription,
                card: null, // no hay info si no existe preapprovalId en MP
            };
        }

        // Llamada a MercadoPago
        const preapproval = await this.mercadoPagoService.getSubscription(subscription.externalId);

        // Extraer datos de tarjeta si existen
        const cardInfo = preapproval?.payer?.card
            ? {
                brand: preapproval.payer.card.payment_method_id, // ej: visa, mastercard
                last4: preapproval.payer.card.last_four_digits,
                expMonth: preapproval.payer.card.expiration_month,
                expYear: preapproval.payer.card.expiration_year,
            }
            : null;

        return {
            ...subscription,
            card: cardInfo,
        };
    }


    /** -------------------
     * Helpers
     * ------------------- */
    private calculateEndDate(startDate: Date, plan: SubscriptionPlan): Date {

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