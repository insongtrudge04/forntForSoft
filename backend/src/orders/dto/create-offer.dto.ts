import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  artworkId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsString()
  message?: string;
}
