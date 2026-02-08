import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SitesModule } from './sites/sites.module';
import { OrdersModule } from "./orders/orders.module";
import { AppI18nModule } from "./i18n/i18n.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA || "public",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
    }),
    UsersModule,
    AuthModule,
    DashboardModule,
    SitesModule,
    OrdersModule,
    AppI18nModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
