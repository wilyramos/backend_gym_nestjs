import { Controller, Post, Param, Body, Patch, Get, UseGuards, Req, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

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
    console.log('User ID from JWT:', req.user.id);
    return this.paymentsService.findByUser(req.user.id);
  }
}
