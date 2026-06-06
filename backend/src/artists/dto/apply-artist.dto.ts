import { IsString, IsOptional } from 'class-validator';

export class ApplyArtistDto {
  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  instagramHandle?: string;
}
