// src/memberships/dto/query-memberships.dto.ts
import { IsInt, IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MembershipStatus } from '../entities/membership.entity';

export class QueryMembershipsDto {
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsEnum(MembershipStatus)
    status?: MembershipStatus;

    @IsOptional()
    @IsString()
    search?: string; // buscar por nombre/email de usuario
}
