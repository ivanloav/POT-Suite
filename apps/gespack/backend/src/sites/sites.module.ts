import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesService } from './sites.service';
import { SitesController } from './sites.controller';
import { Site } from '../entities/site.entity';
import { UserSite } from 'src/entities/user-site.entity';
import { User } from 'src/entities/user.entity';
import { SiteGuard } from 'src/shared/guards/site.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Site, UserSite, User])],
  controllers: [SitesController],
  providers: [SitesService, SiteGuard],
  exports: [SitesService, SiteGuard],
})
export class SitesModule {}