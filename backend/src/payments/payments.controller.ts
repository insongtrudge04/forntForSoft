import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Roles('buyer')
  @Post('checkout')
  createCheckout(@Body() body: CreateCheckoutDto, @CurrentUser('userId') userId: string) {
    return this.paymentsService.createCheckoutSession(body.artworkId, userId, body.successUrl, body.cancelUrl);
  }

  @Public()
  @Post('webhook')
  handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') sig: string) {
    return this.paymentsService.handleWebhook(req.rawBody!, sig);
  }
}
