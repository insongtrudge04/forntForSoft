import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { ModerateArtworkDto } from './dto/moderate-artwork.dto';
import { UpdateCommissionDto } from './dto/update-commission.dto';
import { ModerateArtistDto } from './dto/moderate-artist.dto';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats') getStats() { return this.adminService.getPlatformStats(); }
  @Get('artworks/pending') getPending() { return this.adminService.getPendingArtworks(); }
  @Patch('artworks/:id/moderate') moderate(@Param('id') id: string, @Body() b: ModerateArtworkDto) { return this.adminService.moderateArtwork(id, b.action); }
  @Post('artworks/:id/feature') setFeatured(@Param('id') id: string) { return this.adminService.setFeaturedArtwork(id); }
  @Get('users') getUsers(@Query('page') p?: number, @Query('limit') l?: number) { return this.adminService.getAllUsers(p, l); }
  @Patch('settings/commission') setCommission(@Body() b: UpdateCommissionDto) { return this.adminService.updateCommissionRate(b.rate); }
  @Get('artists/pending') getPendingArtists() { return this.adminService.getPendingArtists(); }
  @Patch('artists/:id/moderate') moderateArtist(@Param('id') id: string, @Body() b: ModerateArtistDto) { return this.adminService.moderateArtist(id, b.action); }
}
