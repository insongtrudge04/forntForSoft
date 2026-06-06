import { IsString, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @IsString()
  artworkId: string;

  @IsUrl({ require_protocol: true })
  successUrl: string;

  @IsUrl({ require_protocol: true })
  cancelUrl: string;
}
