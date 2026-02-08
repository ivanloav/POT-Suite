import { IsOptional, IsEnum, IsInt, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../../entities/orders.entity';

export class FindOrdersQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() siteId?: number;
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsString() qId?: string;
  @IsOptional() @IsString() qSiteId?: string;
  @IsOptional() @IsString() qOrderReference?: string;
  @IsOptional() @IsString() qBrandId?: string;
  @IsOptional() @IsString() qFullName?: string;
  @IsOptional() @IsString() qPaymentTypeId?: string;
  @IsOptional() @IsString() qOrderAmount?: string;
  @IsOptional() @IsString() qStatus?: string;
  @IsOptional() @IsString() qCreated?: string;
  @IsOptional() @IsString() qBrandName?: string;
  @IsOptional() @IsString() qSiteName?: string;
  @IsOptional() @IsString() qPaymentTypeName?: string;
  @IsOptional() @IsString() qPaidAt?: string;

  @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @Type(() => Number) @IsInt() @Min(1)
  limit = 10;

  @IsOptional() @IsString()
  sortBy?: string;

  @IsIn(['ASC', 'DESC'])
  sortDir: 'ASC' | 'DESC' = 'DESC';
}