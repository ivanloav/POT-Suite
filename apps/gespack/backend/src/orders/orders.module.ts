import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../entities/orders.entity';
import { OrderItem } from '../entities/order-items.entity';
import { OrderPayments } from '../entities/order-payments.entity';
import { OrderAddress } from '../entities/order-addresses.entity';
import { OrderNotes } from '../entities/order-notes.entity';
import { UserSite } from 'src/entities/user-site.entity';
import { OrderSource } from '../entities/order-sources.entity';
import { Action } from '../entities/action.entity';
import { Customer } from 'src/entities/customers.entity';
import { CustomerType } from 'src/entities/customer-types.entity';
import { SitesModule } from '../sites/sites.module';
import { UsersModule } from '../users/users.module';
import { Product } from 'src/entities/product.entity';
import { ActionPriorityType } from 'src/entities/action-priority-types.entity';
import { OrderPaymentTypes } from 'src/entities/order-payment-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderPayments, OrderAddress, OrderNotes, UserSite, OrderSource, Action, Customer, CustomerType, Product, ActionPriorityType, OrderPaymentTypes]),
  SitesModule,
  UsersModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}