import {
    Controller,
    Post,
    Param,
    Body,
    Patch,
    Get,
    UseGuards,
    Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('payments')
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService

    ) { }

    // ---- PAGOS ÚNICOS ----
    @Post(':subscriptionId')
    createPayment(
        @Param('subscriptionId') subscriptionId: number,
        @Body() body: Partial<Payment>,
    ) {
        return this.paymentsService.createPayment(subscriptionId, body);
    }

    @Patch(':id/confirm')
    confirm(@Param('id') id: number, @Body('externalId') externalId?: string) {
        return this.paymentsService.confirmPayment(id, externalId);
    }

    @Patch(':id/fail')
    fail(@Param('id') id: number) {
        return this.paymentsService.failPayment(id);
    }

    @Patch(':id/refund')
    refund(@Param('id') id: number) {
        return this.paymentsService.refundPayment(id);
    }

    @Get('subscription/:subscriptionId')
    findBySubscription(@Param('subscriptionId') subscriptionId: number) {
        return this.paymentsService.findBySubscription(subscriptionId);
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.paymentsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me/history')
    findMyPayments(@Request() req) {
        return this.paymentsService.findByUser(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("user/:userId/history")
    @Roles('ADMIN')
    findUserPayments(@Param("userId") userId: number) {
        return this.paymentsService.findByUser(userId);
    }

    // ---- SUSCRIPCIONES RECURRENTES ----
    @Post(':subscriptionId/activate')
    createSubscription(
        @Param('subscriptionId') subscriptionId: number,
    ) {
        return this.paymentsService.activateSubscriptionInGateway(
            subscriptionId
        );
    }
}