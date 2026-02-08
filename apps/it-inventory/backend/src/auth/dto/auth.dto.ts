import { IsEmail, IsNotEmpty, MinLength, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterUserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - roleCode
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: admin@itinventory.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: Contraseña del usuario (mínimo 6 caracteres)
 *           example: MySecurePass123
 *         roleCode:
 *           type: string
 *           description: Código del rol a asignar (ADMIN, USER)
 *           example: USER
 *         siteId:
 *           type: number
 *           description: ID de la sede a la que pertenece el usuario
 *           example: 1
 */
export class RegisterUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@itinventory.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    example: 'MySecurePass123',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Código del rol a asignar (ADMIN, USER)',
    example: 'USER',
  })
  @IsNotEmpty()
  roleCode: string;

  @ApiProperty({
    description: 'ID de la sede a la que pertenece el usuario',
    example: 1,
  })
  @IsInt()
  @Min(1)
  siteId: number;
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginUserDto:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: admin@itinventory.com
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *           example: MySecurePass123
 */
export class LoginUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@itinventory.com',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MySecurePass123',
  })
  @IsNotEmpty()
  password: string;
}
