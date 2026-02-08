import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class PermissionsAdminService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      relations: ['creator', 'updater'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['creator', 'updater'],
    });

    if (!permission) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permission;
  }

  async create(createPermissionDto: CreatePermissionDto, userId: number): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });

    if (existingPermission) {
      throw new ConflictException('El código de permiso ya existe');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      isActive: createPermissionDto.isActive ?? true,
      createdBy: userId,
    });

    let savedPermission: Permission;
    try {
      savedPermission = await this.permissionRepository.save(permission);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El código de permiso ya existe');
      }
      throw error;
    }
    return await this.findOne(savedPermission.id);
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto, userId: number): Promise<Permission> {
    const permission = await this.findOne(id);

    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });

      if (existingPermission) {
        throw new ConflictException('El código de permiso ya existe');
      }
    }

    Object.assign(permission, { ...updatePermissionDto, updatedBy: userId });

    try {
      await this.permissionRepository.save(permission);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El código de permiso ya existe');
      }
      throw error;
    }
    return await this.findOne(id);
  }

  async exportToExcel(): Promise<Buffer> {
    const permissions = await this.findAll();

    const data = permissions.map(permission => ({
      ID: permission.id,
      'Código': permission.code,
      'Nombre': permission.name,
      'Estado': permission.isActive ? 'Activo' : 'Inactivo',
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Permisos');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const templateData = [
      {
        'Código': 'assets.read',
        'Nombre': 'Leer Activos',
        'Descripción': 'Permiso para ver activos',
        'Estado': 'Activo',
      },
    ];

    const instructions = [
      { Campo: 'Código', Descripción: 'Código único del permiso (formato: recurso.accion)', Requerido: 'Sí' },
      { Campo: 'Nombre', Descripción: 'Nombre descriptivo del permiso', Requerido: 'Sí' },
      { Campo: 'Descripción', Descripción: 'Descripción detallada del permiso', Requerido: 'No' },
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

        const existingPermission = await this.permissionRepository.findOne({
          where: { code },
        });

        if (existingPermission) {
          duplicados++;
          continue;
        }

        const permission = this.permissionRepository.create({
          code,
          name,
          isActive: estado === 'Inactivo' ? false : true,
        });

        await this.permissionRepository.save(permission);
        insertados++;
      } catch (error: any) {
        errores.push(`Error procesando fila: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }
}
