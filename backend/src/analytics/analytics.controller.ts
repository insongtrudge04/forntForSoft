import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Roles('artist')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('me')
  getMyAnalytics(@CurrentUser('userId') userId: string) {
    return this.analyticsService.getArtistAnalytics(userId);
  }

  @Get('artworks/:id/views')
  getViews(@Param('id') id: string, @Query('days') days?: number) {
    return this.analyticsService.getViewsOverTime(id, days);
  }
}
