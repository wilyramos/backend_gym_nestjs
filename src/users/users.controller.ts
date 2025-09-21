import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard.ts';


@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('me') // Colocada antes de :id
    getMe(@Request() req) {
        return this.usersService.getUser(req.user.id);
    }

    @Patch('/me')
    updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(req.user.id, updateUserDto);
    }

    @Get()
    @Roles('ADMIN')
    findAll(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('search') search?: string,
    ) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        return this.usersService.findAll({ page: pageNumber, limit: limitNumber, search });
    }

    @Get('with-memberships')
    @Roles('ADMIN')
    findAllWithMemberships(
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit) || 10;
        return this.usersService.findAllWithLastMembership({ page: pageNumber, limit: limitNumber });
    }

    // Change password endpoint
    @Post('change-password')
    changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
        const userId = req.user.id;
        const { currentPassword, newPassword } = body;
        return this.usersService.changePassword(userId, currentPassword, newPassword);
    }

    // Verify password
    @Post('verify-password')
    verifyPassword(@Request() req, @Body() body: { password: string }) {
        const userId = req.user.id;
        const { password } = body;
        return this.usersService.verifyPassword(userId, password);
    }

    @Get(':id') // rutas dinámicas van al final
    @Roles('ADMIN', 'CLIENT')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}