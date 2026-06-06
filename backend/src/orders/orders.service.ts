import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findByBuyer(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { artwork: { include: { images: { take: 1, orderBy: { order: 'asc' } }, artist: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByArtist(artistId: string) {
    return this.prisma.order.findMany({
      where: { artwork: { artistId } },
      include: { artwork: { include: { images: { take: 1, orderBy: { order: 'asc' } } } }, buyer: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async saveWork(buyerId: string, artworkId: string) {
    return this.prisma.savedWork.upsert({
      where: { buyerId_artworkId: { buyerId, artworkId } },
      create: { buyerId, artworkId },
      update: {},
    });
  }

  async unsaveWork(buyerId: string, artworkId: string) {
    return this.prisma.savedWork.deleteMany({ where: { buyerId, artworkId } });
  }

  async getSavedWorks(buyerId: string) {
    return this.prisma.savedWork.findMany({
      where: { buyerId },
      include: { artwork: { include: { images: { take: 1, orderBy: { order: 'asc' } }, artist: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOffer(buyerId: string, artworkId: string, amount: number, message?: string) {
    return this.prisma.offer.create({ data: { buyerId, artworkId, amount, message } });
  }
}
