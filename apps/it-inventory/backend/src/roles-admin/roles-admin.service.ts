import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
import * as xlsx from 'xlsx';

@Injectable()
export class RolesAdminService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(forwardRef(() => RolePermissionsService))
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['creator', 'updater'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto, userId: number): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { code: createRoleDto.code },
    });

    if (existingRole) {
      throw new ConflictException('El código de rol ya existe');
    }

    const { permissionIds, ...roleData } = createRoleDto;
    const role = this.roleRepository.create({
      ...roleData,
      isActive: roleData.isActive ?? true,
      createdBy: userId,
    });

    let savedRole: Role;
    try {
      savedRole = await this.roleRepository.save(role);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El código de rol ya existe');
      }
      throw error;
    }

    // Guardar permisos si se proporcionaron
    if (permissionIds && permissionIds.length > 0) {
      await this.rolePermissionsService.updateByRole(savedRole.id, permissionIds);
    }

    return await this.findOne(savedRole.id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, userId: number): Promise<Role> {
    const role = await this.findOne(id);

    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existingRole = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });

      if (existingRole) {
        throw new ConflictException('El código de rol ya existe');
      }
    }

    const { permissionIds, ...roleData } = updateRoleDto;
    Object.assign(role, { ...roleData, updatedBy: userId });

    try {
      await this.roleRepository.save(role);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El código de rol ya existe');
      }
      throw error;
    }

    // Actualizar permisos si se proporcionaron
    if (permissionIds !== undefined) {
      await this.rolePermissionsService.updateByRole(id, permissionIds);
    }

    return await this.findOne(id);
  }

  async exportToExcel(): Promise<Buffer> {
    const roles = await this.findAll();

    const data = roles.map(role => ({
      ID: role.id,
      'Código': role.code,
      'Nombre': role.name,
      'Estado': role.isActive ? 'Activo' : 'Inactivo',
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Roles');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const templateData = [
      {
        'Código': 'viewer',
        'Nombre': 'Visualizador',
        'Descripción': 'Rol con permisos de solo lectura',
        'Estado': 'Activo',
      },
    ];

    const instructions = [
      { Campo: 'Código', Descripción: 'Código único del rol (sin espacios)', Requerido: 'Sí' },
      { Campo: 'Nombre', Descripción: 'Nombre descriptivo del rol', Requerido: 'Sí' },
      { Campo: 'Descripción', Descripción: 'Descripción detallada del rol', Requerido: 'No' },
      { Campo: 'Estado', Descripción: 'Activo o Inactivo', Requerido: 'No (por defecto Activo)' },
    ];

    const ws1 = xlsx.utils.json_to_sheet(templateData);
    const ws2 = xlsx.utils.json_to_sheet(instructions);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws1, 'Datos');
    xlsx.utils.book_append_sheet(wb, ws2, 'Instrucciones');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async importFromExcel(buffer: Buffer): Promise<{ insertados: number; duplicados: number; errores: string[] }> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);

    let insertados = 0;
    let duplicados = 0;
    const errores: string[] = [];

    for (const row of rows) {
      try {
        const code = row['Código'];
        const name = row['Nombre'];
        const estado = row['Estado'];

        if (!code || !name) {
          errores.push(`Fila con datos incompletos (se requiere Código y Nombre)`);
          continue;
        }

        const existingRole = await this.roleRepository.findOne({
          where: { code },
        });

        if (existingRole) {
          duplicados++;
          continue;
        }

        const role = this.roleRepository.create({
          code,
          name,
          isActive: estado === 'Inactivo' ? false : true,
        });

        await this.roleRepository.save(role);
        insertados++;
      } catch (error: any) {
        errores.push(`Error procesando fila: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }
}
