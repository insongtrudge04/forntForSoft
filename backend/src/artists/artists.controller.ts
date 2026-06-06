import { Controller, Get, Post, Patch, Param, Body, ConflictException } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateArtistProfileDto } from './dto/update-profile.dto';
import { ApplyArtistDto } from './dto/apply-artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly artistsService: ArtistsService) {}

  @Public()
  @Get('count')
  getCount() {
    return this.artistsService.countApproved();
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.artistsService.findBySlug(slug);
  }

  @Post('apply')
  apply(@Body() body: ApplyArtistDto, @CurrentUser('userId') userId: string) {
    return this.artistsService.apply(userId, body);
  }

  @Get('my-status')
  getMyStatus(@CurrentUser('userId') userId: string) {
    return this.artistsService.getMyStatus(userId);
  }

  @Roles('artist')
  @Get('me')
  getMe(@CurrentUser('userId') userId: string) {
    return this.artistsService.getProfileByUserId(userId);
  }

  @Roles('artist')
  @Patch('me')
  updateMe(@Body() body: UpdateArtistProfileDto, @CurrentUser('userId') userId: string) {
    return this.artistsService.updateProfile(userId, body);
  }
}
