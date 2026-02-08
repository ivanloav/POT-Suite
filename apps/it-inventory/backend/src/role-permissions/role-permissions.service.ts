import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { CreateRolePermissionDto, DeleteRolePermissionDto } from './dto/role-permission.dto';

@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async getByRole(roleId: number): Promise<RolePermission[]> {
    return await this.rolePermissionRepository.find({
      where: { roleId },
      relations: ['role', 'permission'],
      order: { permission: { name: 'ASC' } },
    });
  }

  async create(createDto: CreateRolePermissionDto): Promise<RolePermission> {
    // Verificar si ya existe
    const existing = await this.rolePermissionRepository.findOne({
      where: {
        roleId: createDto.roleId,
        permissionId: createDto.permissionId,
      },
    });

    if (existing) {
      throw new ConflictException('Esta relación ya existe');
    }

    const rolePermission = this.rolePermissionRepository.create(createDto);
    return await this.rolePermissionRepository.save(rolePermission);
  }

  async delete(deleteDto: DeleteRolePermissionDto): Promise<void> {
    await this.rolePermissionRepository.delete({
      roleId: deleteDto.roleId,
      permissionId: deleteDto.permissionId,
    });
  }

  async updateByRole(roleId: number, permissionIds: number[]): Promise<void> {
    // Eliminar todos los permisos actuales del rol
    await this.rolePermissionRepository.delete({ roleId });

    // Crear las nuevas relaciones
    if (permissionIds && permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        roleId,
        permissionId,
      }));
      await this.rolePermissionRepository.save(rolePermissions);
    }
  }
}
