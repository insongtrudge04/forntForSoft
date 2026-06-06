import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15' as any,
    });
  }

  async createCheckoutSession(artworkId: string, buyerId: string, successUrl: string, cancelUrl: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { images: { take: 1 }, artist: true },
    });
    if (!artwork) throw new BadRequestException('Artwork not found');

    const commissionRate = Number((await this.prisma.platformConfig.findFirst())?.commissionRate ?? 0.1);
    const subtotal = Number(artwork.price);
    const platformFee = Math.round(subtotal * commissionRate * 100) / 100;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(subtotal * 100),
          product_data: {
            name: artwork.title,
            images: artwork.images.length ? [artwork.images[0].url] : [],
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: artwork.artist.stripeAccountId
          ? { destination: artwork.artist.stripeAccountId }
          : undefined,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { artworkId, buyerId },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const { artworkId, buyerId } = session.metadata || {};
      if (artworkId && buyerId) {
        const artwork = await this.prisma.artwork.findUnique({ where: { id: artworkId } });
        if (artwork) {
          const commissionRate = Number((await this.prisma.platformConfig.findFirst())?.commissionRate ?? 0.1);
          const subtotal = Number(artwork.price);
          const platformFee = Math.round(subtotal * commissionRate * 100) / 100;
          await Promise.all([
            this.prisma.order.create({
              data: {
                buyerId, artworkId,
                status: 'paid',
                subtotal, platformFee,
                artistPayout: subtotal - platformFee,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string,
                shippingLine1: 'TBD', shippingCity: 'TBD', shippingState: 'TBD', shippingPostal: 'TBD', shippingCountry: 'US',
              },
            }),
            this.prisma.artwork.update({ where: { id: artworkId }, data: { status: 'sold' } }),
          ]);
        }
      }
    }

    return { received: true };
  }
}
