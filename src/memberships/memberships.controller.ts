import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

import { Roles, ROLES_KEY } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard.ts';


@Controller('memberships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembershipsController {

    constructor(
        private readonly membershipsService: MembershipsService
    ) { }


    // Admin create membership for anyone user
    @Post()
    @Roles('ADMIN')
    async create(@Body() createMembershipDto: CreateMembershipDto) {

        const membership = await this.membershipsService.create(createMembershipDto);
        return membership;
    }

    // User subscribe to a membership

    @Post('subscribe')
    @Roles('CLIENT')
    async subscribe(@Body() createMembershipDto: CreateMembershipDto, @Req() req) {
        createMembershipDto.userId = req.user.id;
        const membership = await this.membershipsService.create(createMembershipDto);

        // payment extern with mercadopago

        return membership;
    }

    // List memberships
    @Get()
    @Roles('ADMIN', 'TRAINER')
    findAll() {
        return this.membershipsService.findAll();
    }

    // list my memberships
    @Get("my-memberships")
    @Roles('CLIENT')
    async myMemberships(@Req() req) {
        return this.membershipsService.findByUser(req.user.id);
    }

    // get membership by id
    @Get(':id')
    async findOne(@Param('id') id: string, @Req() req) {
        const membership = await this.membershipsService.findOne(+id);
        const user = req.user;

        if (user.role !== 'ADMIN' && user.role !== 'TRAINER' && membership.user.id !== user.id) {
            throw new ForbiddenException('Access denied');
        }
        return membership;
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateMembershipDto: UpdateMembershipDto) {
        return this.membershipsService.update(+id, updateMembershipDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.membershipsService.remove(+id);
    }
}
