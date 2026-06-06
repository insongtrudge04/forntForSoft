import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Ip, Headers } from '@nestjs/common';
import { ArtworksService } from './artworks.service';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateArtworkDto } from './dto/create-artwork.dto';
import { UpdateArtworkDto } from './dto/update-artwork.dto';
import { ArtworkQueryDto } from './dto/artwork-query.dto';

@Controller('artworks')
export class ArtworksController {
  constructor(private readonly artworksService: ArtworksService) {}

  @Public()
  @Get()
  findAll(@Query() query: ArtworkQueryDto) {
    return this.artworksService.findAll(query);
  }

  @Public()
  @Get('featured')
  getFeatured() {
    return this.artworksService.findFeatured();
  }

  @Public()
  @Get('new-arrivals')
  getNewArrivals(@Query('limit') limit?: number) {
    return this.artworksService.findNewArrivals(limit);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.artworksService.findBySlug(slug);
  }

  @Roles('artist')
  @Post()
  create(@Body() body: CreateArtworkDto, @CurrentUser('userId') userId: string) {
    return this.artworksService.create(userId, body);
  }

  @Roles('artist')
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateArtworkDto, @CurrentUser('userId') userId: string) {
    return this.artworksService.update(id, userId, body);
  }

  @Roles('artist')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.artworksService.delete(id, userId);
  }

  @Public()
  @Post(':id/view')
  trackView(@Param('id') id: string, @Ip() ip: string, @Headers('user-agent') ua: string) {
    return this.artworksService.incrementView(id, ip, ua);
  }
}
