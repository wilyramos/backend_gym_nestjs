import type { MembershipStatus } from "src/memberships/entities/membership.entity";
import { SubscriptionPlan } from '../entities/subscription.entity';
import { SubscriptionStatus } from "../entities/subscription.entity";

export class SubscriptionResponseDto {
    id: number;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    externalId?: string;
    startDate: Date;
    endDate?: Date;
    membership: {
        id: number;
        status: MembershipStatus;
        validFrom: Date;
        validTo: Date;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
}
