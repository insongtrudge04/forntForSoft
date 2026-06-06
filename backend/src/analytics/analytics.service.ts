import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getArtistAnalytics(artistId: string) {
    const artworks = await this.prisma.artwork.findMany({
      where: { artistId },
      select: {
        id: true, title: true, viewCount: true,
        _count: { select: { savedBy: true } },
        orders: { where: { status: { in: ['paid', 'fulfilled'] } }, select: { artistPayout: true } },
      },
    });

    return artworks.map((a) => ({
      artworkId: a.id,
      title: a.title,
      views: a.viewCount,
      saves: a._count.savedBy,
      revenue: a.orders.reduce((sum, o) => sum + Number(o.artistPayout), 0),
    }));
  }

  async getViewsOverTime(artworkId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.prisma.artworkViewEvent.groupBy({
      by: ['createdAt'],
      where: { artworkId, createdAt: { gte: since } },
      _count: true,
      orderBy: { createdAt: 'asc' },
    });
  }
}
