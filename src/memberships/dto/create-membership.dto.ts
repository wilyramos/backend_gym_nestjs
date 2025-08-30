// src/memberships/dto/create-membership.dto.ts
import { IsEnum, IsNotEmpty, IsDateString, IsInt } from 'class-validator';
import { MembershipStatus } from '../entities/membership.entity';

export class CreateMembershipDto {
    @IsInt()
    @IsNotEmpty()
    userId: number;

    @IsInt()
    @IsNotEmpty()
    subscriptionId: number;

    @IsEnum(MembershipStatus)
    status?: MembershipStatus;

    @IsDateString()
    validFrom: Date;

    @IsDateString()
    validTo: Date;
}
