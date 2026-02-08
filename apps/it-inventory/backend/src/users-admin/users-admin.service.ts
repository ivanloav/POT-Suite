import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSite } from '../entities/user-site.entity';
import { UserSiteRole } from '../entities/user-site-role.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import * as xlsx from 'xlsx';

@Injectable()
export class UsersAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSite)
    private readonly userSiteRepository: Repository<UserSite>,
    @InjectRepository(UserSiteRole)
    private readonly userSiteRoleRepository: Repository<UserSiteRole>,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['userSites', 'userSiteRoles', 'userSiteRoles.role', 'creator', 'updater'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['userSites', 'userSiteRoles', 'userSiteRoles.role', 'creator', 'updater'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, userId: number): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      userName: createUserDto.userName,
      email: createUserDto.email,
      passwordHash,
      language: createUserDto.language || 'es',
      isActive: createUserDto.isActive ?? true,
      createdBy: userId,
    });

    let savedUser: User;
    try {
      savedUser = await this.userRepository.save(user);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }

    // Crear relaciones con sitios
    if (createUserDto.siteIds && createUserDto.siteIds.length > 0) {
      const userSites = createUserDto.siteIds.map(siteId => ({
        userId: savedUser.id,
        siteId: siteId,
        isActive: true,
      }));
      await this.userSiteRepository.insert(userSites);
    }

    // Crear relaciones con roles por sitio
    if (createUserDto.roleIds && createUserDto.roleIds.length > 0 && 
        createUserDto.siteIds && createUserDto.siteIds.length > 0) {
      const userSiteRoles = [];
      for (const siteId of createUserDto.siteIds) {
        for (const roleId of createUserDto.roleIds) {
          userSiteRoles.push({
            userId: savedUser.id,
            siteId: siteId,
            roleId: roleId,
          });
        }
      }
      await this.userSiteRoleRepository.insert(userSiteRoles);
    }

    return await this.findOne(savedUser.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto, userId: number): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    if (updateUserDto.password) {
      user.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, {
      userName: updateUserDto.userName ?? user.userName,
      email: updateUserDto.email ?? user.email,
      language: updateUserDto.language ?? user.language,
      isActive: updateUserDto.isActive ?? user.isActive,
      updatedBy: userId,
    });

    try {
      await this.userRepository.save(user);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }

    // Actualizar relaciones con sitios
    if (updateUserDto.siteIds !== undefined) {
      // Eliminar sitios existentes
      await this.userSiteRepository.delete({ userId: id });
      
      // Crear nuevos sitios
      if (updateUserDto.siteIds.length > 0) {
        const userSites = updateUserDto.siteIds.map(siteId => ({
          userId: id,
          siteId: siteId,
          isActive: true,
        }));
        await this.userSiteRepository.insert(userSites);
      }
    }

    // Actualizar relaciones con roles por sitio
    if (updateUserDto.roleIds !== undefined && updateUserDto.siteIds !== undefined) {
      // Eliminar roles existentes
      await this.userSiteRoleRepository.delete({ userId: id });
      
      // Crear nuevos roles
      if (updateUserDto.roleIds.length > 0 && updateUserDto.siteIds.length > 0) {
        const userSiteRoles = [];
        for (const siteId of updateUserDto.siteIds) {
          for (const roleId of updateUserDto.roleIds) {
            userSiteRoles.push({
              userId: id,
              siteId: siteId,
              roleId: roleId,
            });
          }
        }
        await this.userSiteRoleRepository.insert(userSiteRoles);
      }
    }

    return await this.findOne(id);
  }

  async exportToExcel(): Promise<Buffer> {
    const users = await this.findAll();

    const data = users.map(user => ({
      ID: user.id,
      'Nombre de Usuario': user.userName,
      'Email': user.email,
      'Estado': user.isActive ? 'Activo' : 'Inactivo',
      'Fecha Creación': user.createdAt,
      'Última Actualización': user.updatedAt,
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Usuarios');

    return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateTemplate(): Promise<Buffer> {
    const templateData = [
      {
        'Nombre de Usuario': 'Juan Pérez',
        'Email': 'juan.perez@empresa.com',
        'Contraseña': 'password123',
        'Estado': 'Activo',
      },
    ];

    const instructions = [
      { Campo: 'Nombre de Usuario', Descripción: 'Nombre completo del usuario', Requerido: 'Sí' },
      { Campo: 'Email', Descripción: 'Email único del usuario', Requerido: 'Sí' },
      { Campo: 'Contraseña', Descripción: 'Contraseña (mínimo 6 caracteres)', Requerido: 'Sí' },
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
        const userName = row['Nombre de Usuario'];
        const email = row['Email'];
        const password = row['Contraseña'];
        const estado = row['Estado'];

        if (!userName || !email || !password) {
          errores.push(`Fila con datos incompletos (se requiere Nombre, Email y Contraseña)`);
          continue;
        }

        const existingUser = await this.userRepository.findOne({
          where: { email },
        });

        if (existingUser) {
          duplicados++;
          continue;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = this.userRepository.create({
          userName,
          email,
          passwordHash,
          isActive: estado === 'Inactivo' ? false : true,
        });

        await this.userRepository.save(user);
        insertados++;
      } catch (error: any) {
        errores.push(`Error procesando fila: ${error.message}`);
      }
    }

    return { insertados, duplicados, errores };
  }
}
