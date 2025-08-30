// src/memberships/memberships.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { QueryMembershipsDto } from './dto/query-memberships.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard.ts';
import { UserRole } from '../users/entities/user.entity';

@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() createMembershipDto: CreateMembershipDto) {
        return this.membershipsService.create(createMembershipDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query() query: QueryMembershipsDto) {
        return this.membershipsService.findAll(query);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.CLIENT)
    findOne(@Param('id') id: string) {
        return this.membershipsService.findOne(+id);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body() updateMembershipDto: UpdateMembershipDto,
    ) {
        return this.membershipsService.update(+id, updateMembershipDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.membershipsService.remove(+id);
    }
}