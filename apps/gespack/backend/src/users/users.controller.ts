/**
 * Controlador de usuarios.
 * 
 * Administra la gestión de usuarios en el sistema: creación, búsqueda y listado.
 * Protegido por JwtAuthGuard y SiteGuard, se asegura de que sólo usuarios autorizados accedan a la información.
 * 
 * Endpoints:
 * - GET /users → Devuelve lista paginada y filtrable de usuarios.
 * - GET /users/:name → Busca un usuario por nombre de usuario.
 * - POST /users → Crea un nuevo usuario.
 */
import { Controller, Post, Body, Get, Param, UseGuards, Query, Req, ConflictException, ParseIntPipe, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindAllUsersDto } from './dto/find-all-users.dto';
import { User } from '../entities/user.entity';
import {
  ApiTags,
  ApiParam,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SiteGuard } from 'src/shared/guards/site.guard';
import { buildResponse, buildErrorResponse } from 'src/shared/utils/response-builder';
import { I18n, I18nContext } from 'nestjs-i18n';
import { UserSiteResponseDto } from 'src/sites/dto/user-site.dto';
import { FindUserByIdDto } from './dto/find-user-by-id.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, SiteGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [User],
  })

  @Get()
  async findAll(
    @I18n() i18n: I18nContext,
    @Query() query: FindAllUsersDto,
  ) {
    try {
      const { data, total } = await this.usersService.findAll(query);

      return buildResponse(data, await i18n.t('users.list_success'), total);
    } catch (error) {
      return buildErrorResponse(await i18n.t('users.error_list'), error);
    }
  }

  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', required: true, description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'El usuario ha sido encontrado.',
    type: User,
  })
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<{
    success: boolean;
    data: FindUserByIdDto | null;
    message: string;
  }> {
    
    try {
      const user = await this.usersService.findUserById(id);
      
      if (!user) {
        console.log("Usuario no encontrado");
        return {
          success: false,
          data: null,
          message: 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        data: user, // 👈 Ahora es tipo FindUserByIdDto
        message: 'users.detail_success'
      };
    } catch (error) {
      console.error("💥 Error en controller:", error);
      return {
        success: false,
        data: null,
        message: error.message || 'Error interno del servidor'
      };
    }
  }

  @ApiOperation({ summary: 'Obtener usuario por nombre' })
  @ApiParam({ name: 'name', required: true, description: 'Nombre del usuario' })
  @ApiResponse({
    status: 200,
    description: 'El usuario ha sido encontrado.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @Get('username/:name')
  async findByUsername(@Param('name') name: string, @I18n() i18n: I18nContext): Promise<any> {
    try {
      const data = await this.usersService.findByUsername(name);
      return buildResponse(data, await i18n.t('users.detail_success'));
    } catch (error) {
      return buildErrorResponse(await i18n.t('users.error_detail'), error);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return {
        success: true,
        message: 'Usuario creado correctamente',
        data: user
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        return {
          success: false,
          message: error.message,
          error: 'EMAIL_ALREADY_EXISTS'
        };
      }
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', required: true, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto,
    @I18n() i18n: I18nContext
  ): Promise<{
    success: boolean;
    data: FindUserByIdDto | null;
    message: string;
  }> {
    
    try {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);
      
      if (!updatedUser) {
        return {
          success: false,
          data: null,
          message: await i18n.t('users.not_found') || 'Usuario no encontrado'
        };
      }

      return {
        success: true,
        data: updatedUser,
        message: await i18n.t('users.update_success') || 'Usuario actualizado correctamente'
      };
    } catch (error) {
      console.error("💥 Error en update:", error);
      
      return {
        success: false,
        data: null,
        message: error.message || 'Error interno del servidor'
      };
    }
  }
}
