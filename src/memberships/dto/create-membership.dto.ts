import { IsNotEmpty } from "class-validator";
import type { MembershipType } from "../entities/membership.entity";

export class CreateMembershipDto {

    @IsNotEmpty()
    userId: number;

    @IsNotEmpty()
    type: MembershipType; // MONTHLY | QUARTERLY | ANNUAL

    @IsNotEmpty()
    price: number;

    startDate?: Date;
    endDate?: Date;
    paymentId?: number; // opcional si ya existe un pago
}
