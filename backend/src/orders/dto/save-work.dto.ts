import { IsString } from 'class-validator';

export class SaveWorkDto {
  @IsString()
  artworkId: string;
}
