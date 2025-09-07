// src/subscriptions/subscriptions.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    UseGuards,
    Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateSubscriptionDto, @Request() req) {
        const userId = req.user.id;
        console.log("Creating subscription for userId:", userId, "with dto:", dto);
        return this.subscriptionsService.create(dto, userId);
    }


    /** -------------------
     * Listar suscripciones
     * ------------------- */
    @Get()
    findAll() {
        return this.subscriptionsService.findAll();
    }

    /** -------------------
     * Buscar una suscripción
     * ------------------- */
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.subscriptionsService.findOne(id);
    }

    /** -------------------
     * Actualizar suscripción
     * ------------------- */
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSubscriptionDto,
    ) {
        return this.subscriptionsService.update(id, dto);
    }

    /** -------------------
     * Eliminar suscripción
     * ------------------- */
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.subscriptionsService.remove(id);
    }
}