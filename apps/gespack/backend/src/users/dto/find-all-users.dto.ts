// src/users/dto/find-all-users.dto.ts
import { IsInt, IsOptional, IsIn, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllUsersDto {
  @IsOptional() @IsString() qId?: string;          // lo tratamos como string y parseamos a number si procede
  @IsOptional() @IsString() qUserName?: string;
  @IsOptional() @IsString() qEmail?: string;
  @IsOptional() @IsString() qIsCustomer?: string; // 'true' | 'false'
  @IsOptional() @IsString() qIsCB?: string;       // 'true' | 'false'
  @IsOptional() @IsString() qIsList?: string;     // 'true' | 'false'
  @IsOptional() @IsString() qTotalSite?: string;   // lo tratamos como string y parseamos a number si procede
  @IsOptional() @IsString() qSendDailyOrdersReport?: string; // '
  @IsOptional() @IsString() qIsAdmin?: string;    // 'true' | 'false'
  @IsOptional() @IsString() qIsActive?: string;   // 'true' | 'false'
  @IsOptional() @IsString() qCreated?: string;    // 'YYYY-MM-DD' o 'YYYY-MM-DD..YYYY-MM-DD'

  @Type(() => Number) @IsInt() @Min(1)
  page = 1;

  @Type(() => Number) @IsInt() @Min(1)
  limit = 10;

  @IsOptional() @IsString()
  sortBy?: string;

  @IsIn(['ASC', 'DESC'])
  sortDir: 'ASC' | 'DESC' = 'DESC';
}