import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UsersController } from './users.controller'; // Importamos el controlador
import { UserSite } from '../entities/user-site.entity';
import { Site } from '../entities/site.entity';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserSite, Site]), // Importa las entidades User, UserSite y Site
    SitesModule,
  ],
  controllers: [UsersController], // Añadimos el controlador aquí
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
