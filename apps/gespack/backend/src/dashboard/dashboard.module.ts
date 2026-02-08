import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../entities/orders.entity';         // ajusta a tu path real si usas alias
import { UserSite } from '../entities/user-site.entity';  // ajusta a tu path real si usas alias
import { SitesModule } from '../sites/sites.module';
import { UserDashboardConfig } from 'src/entities/user-dashboard-config.entity';
import { DashboardConfigService } from './dashboard-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, UserSite, UserDashboardConfig]),
    SitesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardConfigService],
  exports: [DashboardService, DashboardConfigService],
})
export class DashboardModule {}