import { IsEnum } from 'class-validator';

export class ModerateArtworkDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';
}
