import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRolePermissionDto {
  @ApiProperty({ description: 'ID del rol' })
  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: 'ID del permiso' })
  @IsNotEmpty()
  @IsNumber()
  permissionId: number;
}

export class DeleteRolePermissionDto {
  @ApiProperty({ description: 'ID del rol' })
  @IsNotEmpty()
  @IsNumber()
  roleId: number;

  @ApiProperty({ description: 'ID del permiso' })
  @IsNotEmpty()
  @IsNumber()
  permissionId: number;
}
