// src/memberships/dto/update-membership.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMembershipDto } from './create-membership.dto';

export class UpdateMembershipDto extends PartialType(CreateMembershipDto) {}
