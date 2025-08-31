import { Controller, Get, Post, Param, Body, Patch } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipStatus } from './entities/membership.entity';

@Controller('memberships')
export class MembershipsController {
    constructor(private readonly membershipsService: MembershipsService) { }

    @Post()
    create(@Body() body: any) {
        return this.membershipsService.create(body);
    }

    @Get()
    findAll() {
        return this.membershipsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.membershipsService.findOne(id);
    }

    @Get('user/:userId')
    findByUser(@Param('userId') userId: number) {
        return this.membershipsService.findByUser(userId);
    }

    @Patch(':id/status')
    updateStatus(
        @Param('id') id: number,
        @Body('status') status: MembershipStatus,
    ) {
        return this.membershipsService.updateStatus(id, status);
    }
}