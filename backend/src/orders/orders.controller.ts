import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SaveWorkDto } from './dto/save-work.dto';
import { CreateOfferDto } from './dto/create-offer.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('buyer')
  @Get('me')
  getMyOrders(@CurrentUser('userId') userId: string) {
    return this.ordersService.findByBuyer(userId);
  }

  @Roles('artist')
  @Get('sales')
  getMySales(@CurrentUser('userId') userId: string) {
    return this.ordersService.findByArtist(userId);
  }

  @Roles('buyer')
  @Post('save')
  saveWork(@Body() body: SaveWorkDto, @CurrentUser('userId') userId: string) {
    return this.ordersService.saveWork(userId, body.artworkId);
  }

  @Roles('buyer')
  @Delete('save/:artworkId')
  unsaveWork(@Param('artworkId') artworkId: string, @CurrentUser('userId') userId: string) {
    return this.ordersService.unsaveWork(userId, artworkId);
  }

  @Roles('buyer')
  @Get('saved')
  getSaved(@CurrentUser('userId') userId: string) {
    return this.ordersService.getSavedWorks(userId);
  }

  @Roles('buyer')
  @Post('offers')
  createOffer(@Body() body: CreateOfferDto, @CurrentUser('userId') userId: string) {
    return this.ordersService.createOffer(userId, body.artworkId, body.amount, body.message);
  }
}
