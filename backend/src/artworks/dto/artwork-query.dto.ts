import { IsOptional, IsString, IsEnum, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Medium } from '@prisma/client';

export class ArtworkQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsEnum(Medium, { each: true })
  medium?: Medium[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  artistId?: string;

  @IsOptional()
  @IsEnum(['newest', 'price_asc', 'price_desc', 'most_saved'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'most_saved';

  @IsOptional()
  @IsEnum(['available', 'sold'])
  availability?: 'available' | 'sold';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
