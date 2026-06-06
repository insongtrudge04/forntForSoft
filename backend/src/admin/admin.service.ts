import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtworkStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPlatformStats() {
    const [users, artworks, orders] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.artwork.count({ where: { status: 'live' } }),
      this.prisma.order.aggregate({ _sum: { subtotal: true }, where: { status: { in: ['paid', 'fulfilled'] } } }),
    ]);
    return { users, artworks, totalRevenue: Number(orders._sum.subtotal ?? 0) };
  }

  async getPendingArtworks() {
    return this.prisma.artwork.findMany({ where: { status: 'pending_review' }, include: { images: { take: 1 }, artist: true }, orderBy: { createdAt: 'asc' } });
  }

  async moderateArtwork(id: string, action: 'approve' | 'reject') {
    const status: ArtworkStatus = action === 'approve' ? 'live' : 'rejected';
    return this.prisma.artwork.update({ where: { id }, data: { status } });
  }

  async setFeaturedArtwork(artworkId: string) {
    await this.prisma.artwork.updateMany({ data: { isFeatured: false } });
    return this.prisma.artwork.update({ where: { id: artworkId }, data: { isFeatured: true } });
  }

  async getAllUsers(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateCommissionRate(rate: number) {
    return this.prisma.platformConfig.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', commissionRate: rate },
      update: { commissionRate: rate },
    });
  }

  async getPendingArtists() {
    return this.prisma.artistProfile.findMany({
      where: { status: 'pending' },
      include: { user: { select: { email: true, clerkId: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async moderateArtist(id: string, action: 'approve' | 'reject') {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!profile) throw new NotFoundException('Artist profile not found');

    if (action === 'approve') {
      await this.prisma.artistProfile.update({
        where: { id },
        data: { status: 'approved' },
      });
      await this.prisma.user.update({
        where: { id: profile.userId },
        data: { role: 'artist' },
      });
      try {
        const { createClerkClient } = await import('@clerk/backend');
        const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        await client.users.updateUser(profile.user.clerkId, {
          publicMetadata: { role: 'artist' },
        });
      } catch {
        throw new InternalServerErrorException('Failed to sync role with Clerk');
      }
      return { message: 'Artist application approved', id: profile.id };
    } else {
      return this.prisma.artistProfile.update({
        where: { id },
        data: { status: 'rejected' },
      });
    }
  }
}
