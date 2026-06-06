import { PrismaClient, UserRole, ArtworkStatus, EditionType, Medium, ArtistStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ─── Users ──────────────────────────────────────────────────────────────────
  const artistUser = await prisma.user.upsert({
    where: { email: 'artist@artisell.com' },
    update: {},
    create: {
      clerkId: 'clerk_artist_1',
      email: 'artist@artisell.com',
      role: 'artist',
    },
  });

  const buyerUser = await prisma.user.upsert({
    where: { email: 'buyer@artisell.com' },
    update: {},
    create: {
      clerkId: 'clerk_buyer_1',
      email: 'buyer@artisell.com',
      role: 'buyer',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@artisell.com' },
    update: {},
    create: {
      clerkId: 'clerk_admin_1',
      email: 'admin@artisell.com',
      role: 'admin',
    },
  });

  // ─── Artist Profiles ────────────────────────────────────────────────────────
  const artistProfile = await prisma.artistProfile.upsert({
    where: { userId: artistUser.id },
    update: { status: 'approved' as ArtistStatus },
    create: {
      userId: artistUser.id,
      slug: 'elena-vasquez',
      displayName: 'Elena Vasquez',
      bio: 'Contemporary artist based in Barcelona, exploring the intersection of light and texture through mixed media.',
      avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400',
      website: 'https://elenavasquez.art',
      instagramHandle: '@elenavasquez_art',
      status: 'approved' as ArtistStatus,
    },
  });

  const artistUser2 = await prisma.user.upsert({
    where: { email: 'marcus@artisell.com' },
    update: {},
    create: {
      clerkId: 'clerk_artist_2',
      email: 'marcus@artisell.com',
      role: 'artist',
    },
  });

  const artistProfile2 = await prisma.artistProfile.upsert({
    where: { slug: 'marcus-chen' },
    update: { status: 'approved' as ArtistStatus },
    create: {
      userId: artistUser2.id,
      slug: 'marcus-chen',
      displayName: 'Marcus Chen',
      bio: 'Abstract expressionist working with large-format oil paintings. Based in New York.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
      status: 'approved' as ArtistStatus,
    },
  });

  // ─── Buyer Profiles ─────────────────────────────────────────────────────────
  await prisma.buyerProfile.upsert({
    where: { userId: buyerUser.id },
    update: {},
    create: {
      userId: buyerUser.id,
      displayName: 'Sam Rivera',
      shippingLine1: '123 Art Lover Lane',
      shippingCity: 'San Francisco',
      shippingState: 'CA',
      shippingPostal: '94102',
      shippingCountry: 'US',
    },
  });

  // ─── Artworks ───────────────────────────────────────────────────────────────
  const artworksData = [
    { slug: 'golden-hour-dreams', title: 'Golden Hour Dreams', medium: 'painting' as Medium, price: 2400, width: 120, height: 90, year: 2025, description: 'A luminous exploration of twilight tones captured in oil on canvas.', editionType: 'unique' as EditionType, status: 'live' as ArtworkStatus, isFeatured: true, artistId: artistProfile.id },
    { slug: 'urban-echoes', title: 'Urban Echoes', medium: 'photography' as Medium, price: 800, width: 60, height: 90, year: 2024, description: 'Architectural abstraction series — city reflections in motion.', editionType: 'limited' as EditionType, editionTotal: 25, status: 'live' as ArtworkStatus, artistId: artistProfile.id },
    { slug: 'serenity-in-blue', title: 'Serenity in Blue', medium: 'painting' as Medium, price: 3200, width: 150, height: 120, year: 2025, description: 'Deep blue tones merge with gold leaf in this meditative composition.', editionType: 'unique' as EditionType, status: 'live' as ArtworkStatus, artistId: artistProfile.id },
    { slug: 'fragments-of-memory', title: 'Fragments of Memory', medium: 'mixed_media' as Medium, price: 1800, width: 90, height: 90, year: 2024, description: 'Mixed media collage incorporating found materials and acrylic.', editionType: 'unique' as EditionType, status: 'live' as ArtworkStatus, artistId: artistProfile.id },
    { slug: 'digital-reverie', title: 'Digital Reverie', medium: 'digital' as Medium, price: 400, width: 40, height: 40, year: 2025, description: 'Generative art piece exploring algorithmic color fields.', editionType: 'open' as EditionType, status: 'live' as ArtworkStatus, artistId: artistProfile.id },
    { slug: 'bronze-awakening', title: 'Bronze Awakening', medium: 'sculpture' as Medium, price: 5600, width: 30, height: 80, depth: 30, year: 2023, description: 'Bronze sculpture exploring the human form in abstract motion.', editionType: 'limited' as EditionType, editionTotal: 8, status: 'live' as ArtworkStatus, artistId: artistProfile.id },
    { slug: 'autumn-whispers', title: 'Autumn Whispers', medium: 'painting' as Medium, price: 1500, width: 80, height: 100, year: 2024, description: 'Warm autumnal palette capturing the transition of seasons.', editionType: 'unique' as EditionType, status: 'live' as ArtworkStatus, artistId: artistProfile2.id },
    { slug: 'concrete-jungle', title: 'Concrete Jungle', medium: 'photography' as Medium, price: 600, width: 50, height: 75, year: 2024, description: 'Urban landscape photography from Tokyo at dawn.', editionType: 'limited' as EditionType, editionTotal: 50, status: 'live' as ArtworkStatus, artistId: artistProfile2.id },
    { slug: 'draft-piece', title: 'Draft Piece', medium: 'drawing' as Medium, price: 200, width: 30, height: 40, year: 2025, description: 'A work in progress — pencil study.', editionType: 'unique' as EditionType, status: 'draft' as ArtworkStatus, artistId: artistProfile.id },
  ];

  for (const data of artworksData) {
    const existing = await prisma.artwork.findUnique({ where: { slug: data.slug } });
    if (!existing) {
      const artwork = await prisma.artwork.create({ data });
      // Add images for live artworks
      if (data.status === 'live') {
        await prisma.artworkImage.createMany({
          data: [
            { artworkId: artwork.id, url: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop`, publicId: `seed/${data.slug}-1`, order: 0 },
            { artworkId: artwork.id, url: `https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop&sat=-100`, publicId: `seed/${data.slug}-2`, order: 1 },
          ],
        });
      }
    }
  }

  // ─── Orders ─────────────────────────────────────────────────────────────────
  const liveArtworks = await prisma.artwork.findMany({ where: { status: 'live' }, take: 2 });
  if (liveArtworks.length >= 2) {
    const existingOrder = await prisma.order.findFirst({ where: { buyerId: buyerUser.id } });
    if (!existingOrder) {
      const price1 = Number(liveArtworks[0].price);
      const fee1 = Math.round(price1 * 0.1 * 100) / 100;
      await prisma.order.create({
        data: {
          buyerId: buyerUser.id,
          artworkId: liveArtworks[0].id,
          status: 'paid',
          subtotal: price1,
          platformFee: fee1,
          artistPayout: price1 - fee1,
          shippingLine1: '123 Art Lover Lane',
          shippingCity: 'San Francisco',
          shippingState: 'CA',
          shippingPostal: '94102',
          shippingCountry: 'US',
          stripeSessionId: 'cs_test_seed_1',
          stripePaymentIntentId: 'pi_test_seed_1',
        },
      });

      const price2 = Number(liveArtworks[1].price);
      const fee2 = Math.round(price2 * 0.1 * 100) / 100;
      await prisma.order.create({
        data: {
          buyerId: buyerUser.id,
          artworkId: liveArtworks[1].id,
          status: 'pending',
          subtotal: price2,
          platformFee: fee2,
          artistPayout: price2 - fee2,
          shippingLine1: '123 Art Lover Lane',
          shippingCity: 'San Francisco',
          shippingState: 'CA',
          shippingPostal: '94102',
          shippingCountry: 'US',
        },
      });
    }
  }

  // ─── Saved Works ────────────────────────────────────────────────────────────
  const savedArtwork = await prisma.artwork.findFirst({ where: { status: 'live', slug: 'serenity-in-blue' } });
  if (savedArtwork) {
    await prisma.savedWork.upsert({
      where: { buyerId_artworkId: { buyerId: buyerUser.id, artworkId: savedArtwork.id } },
      update: {},
      create: { buyerId: buyerUser.id, artworkId: savedArtwork.id },
    });
  }

  // ─── Platform Config ────────────────────────────────────────────────────────
  await prisma.platformConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { commissionRate: 0.10 },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
