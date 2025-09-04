import { Controller, Get, Post, Param, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipStatus } from './entities/membership.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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

    // Get membership by user logueado
    @UseGuards(JwtAuthGuard)
    @Get('me')
    findMyMembership(@Request() req) {
        return this.membershipsService.findByUser(req.user.id);
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