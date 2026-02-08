import { IsNotEmpty } from 'class-validator';

export class CreateSiteDto {
  @IsNotEmpty()
  siteName: string;

  @IsNotEmpty()
  siteDescription: string;

  @IsNotEmpty()
  contactInfo: string;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;

}