import { IsString, IsOptional, IsEnum, IsNumber, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Medium, EditionType } from '@prisma/client';

export class ArtworkImageDto {
  @IsString()
  url: string;

  @IsString()
  publicId: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class CreateArtworkDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Medium)
  medium: Medium;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  width?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  depth?: number;

  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(2100)
  year?: number;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsEnum(EditionType)
  editionType: EditionType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  editionTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  editionNumber?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtworkImageDto)
  images?: ArtworkImageDto[];
}
