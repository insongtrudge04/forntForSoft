import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArtistsService {
  constructor(private prisma: PrismaService) {}

  async findBySlug(slug: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { slug },
      include: {
        artworks: {
          where: { status: 'live' },
          include: { images: { orderBy: { order: 'asc' }, take: 1 } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!profile || profile.status !== 'approved') throw new NotFoundException('Artist not found');
    return profile;
  }

  async findByUserId(userId: string) {
    return this.prisma.artistProfile.findUnique({ where: { userId } });
  }

  async getProfileByUserId(userId: string) {
    const profile = await this.prisma.artistProfile.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } },
    });
    if (!profile) throw new NotFoundException('Artist profile not found');
    return profile;
  }

  async updateProfile(userId: string, data: Partial<{ displayName: string; bio: string; avatarUrl: string; website: string; instagramHandle: string }>) {
    const profile = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Artist profile not found');
    if (profile.status !== 'approved') throw new BadRequestException('Profile must be approved before editing');
    return this.prisma.artistProfile.update({ where: { userId }, data });
  }

  async createProfile(userId: string, displayName: string) {
    const slug = displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    try {
      return await this.prisma.artistProfile.create({ data: { userId, slug, displayName } });
    } catch {
      throw new ConflictException('Artist profile already exists');
    }
  }

  async apply(userId: string, data: { displayName: string; bio?: string; website?: string; instagramHandle?: string }) {
    const existing = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (existing) {
      if (existing.status === 'pending') throw new BadRequestException('Application already pending review');
      if (existing.status === 'approved') throw new BadRequestException('You already have an artist profile');
      if (existing.status === 'rejected') throw new BadRequestException('Your previous application was rejected. Contact admin for details.');
    }

    const slug = data.displayName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    return this.prisma.artistProfile.create({
      data: { userId, slug, ...data, status: 'pending' },
    });
  }

  async countApproved() {
    return this.prisma.artistProfile.count({ where: { status: 'approved' } });
  }

  async getMyStatus(userId: string) {
    const profile = await this.prisma.artistProfile.findUnique({ where: { userId } });
    if (!profile) return { hasApplied: false };
    return { hasApplied: true, status: profile.status, profile };
  }
}
