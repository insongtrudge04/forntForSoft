import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ArtworkStatus, Medium, Prisma } from '@prisma/client';

export interface ArtworkFilters {
  query?: string;
  medium?: Medium[];
  minPrice?: number;
  maxPrice?: number;
  artistId?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'most_saved';
  availability?: 'available' | 'sold';
  page?: number;
  limit?: number;
}

@Injectable()
export class ArtworksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ArtworkFilters = {}) {
    const { query, medium, minPrice, maxPrice, artistId, sort = 'newest', availability, page = 1, limit = 24 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ArtworkWhereInput = {
      status: availability === 'sold' ? 'sold' : { in: ['live', 'sold'] as ArtworkStatus[] },
      ...(medium?.length && { medium: { in: medium } }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      ...(artistId && { artistId }),
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy: Prisma.ArtworkOrderByWithRelationInput =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'most_saved' ? { savedBy: { _count: 'desc' } }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.artwork.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { images: { orderBy: { order: 'asc' }, take: 1 }, artist: true, _count: { select: { savedBy: true } } },
      }),
      this.prisma.artwork.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySlug(slug: string) {
    const artwork = await this.prisma.artwork.findUnique({
      where: { slug },
      include: { images: { orderBy: { order: 'asc' } }, artist: true, _count: { select: { savedBy: true } } },
    });
    if (!artwork) throw new NotFoundException('Artwork not found');
    return artwork;
  }

  async findFeatured() {
    return this.prisma.artwork.findFirst({ where: { isFeatured: true, status: 'live' }, include: { images: { take: 1, orderBy: { order: 'asc' } }, artist: true } });
  }

  async findNewArrivals(limit = 8) {
    return this.prisma.artwork.findMany({ where: { status: 'live' }, orderBy: { createdAt: 'desc' }, take: limit, include: { images: { take: 1, orderBy: { order: 'asc' } }, artist: true } });
  }

  async create(artistId: string, data: any) {
    const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    return this.prisma.artwork.create({
      data: { ...data, slug, artistId, status: 'pending_review', images: { create: data.images } },
      include: { images: true },
    });
  }

  async update(id: string, artistId: string, data: any) {
    const artwork = await this.prisma.artwork.findFirst({ where: { id, artistId } });
    if (!artwork) throw new NotFoundException('Artwork not found');
    return this.prisma.artwork.update({ where: { id }, data });
  }

  async delete(id: string, artistId: string) {
    const artwork = await this.prisma.artwork.findFirst({ where: { id, artistId } });
    if (!artwork) throw new NotFoundException('Artwork not found');
    return this.prisma.artwork.delete({ where: { id } });
  }

  async incrementView(id: string, ip?: string, userAgent?: string) {
    await Promise.all([
      this.prisma.artwork.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
      this.prisma.artworkViewEvent.create({ data: { artworkId: id, ip, userAgent } }),
    ]);
  }
}
