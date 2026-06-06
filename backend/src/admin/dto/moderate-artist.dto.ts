import { IsEnum } from 'class-validator';

export class ModerateArtistDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';
}
