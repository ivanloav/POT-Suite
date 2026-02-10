import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { EmployeesModule } from './employees/employees.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { SitesModule } from './sites/sites.module';
import { AssetOsVersionsModule } from './asset-os-versions/asset-os-versions.module';
import { AssetOsFamiliesModule } from './asset-os-families/asset-os-families.module';
import { AssetModelsModule } from './asset-models/asset-models.module';
import { AssetCpuModule } from './asset-cpu/asset-cpu.module';
import { AssetRamModule } from './asset-ram/asset-ram.module';
import { AssetBrandsModule } from './asset-brands/asset-brands.module';
import { AssetTypesModule } from './asset-types/asset-types.module';
import { AssetStatusesModule } from './asset-statuses/asset-statuses.module';
import { SectionsModule } from './sections/sections.module';
import { AssetCpuVendorsModule } from './asset-cpu-vendors/asset-cpu-vendors.module';
import { AssetCpuSegmentsModule } from './asset-cpu-segments/asset-cpu-segments.module';
import { AssetRamMemoryTypesModule } from './asset-ram-memory-types/asset-ram-memory-types.module';
import { AssetRamFormFactorsModule } from './asset-ram-form-factors/asset-ram-form-factors.module';
import { AssetStorageDriveTypesModule } from './asset-storage-drive-types/asset-storage-drive-types.module';
import { AssetStorageInterfacesModule } from './asset-storage-interfaces/asset-storage-interfaces.module';
import { AssetStorageFormFactorsModule } from './asset-storage-form-factors/asset-storage-form-factors.module';
import { AssetStorageModule } from './asset-storage/asset-storage.module';
import { UsersAdminModule } from './users-admin/users-admin.module';
import { RolesAdminModule } from './roles-admin/roles-admin.module';
import { PermissionsAdminModule } from './permissions-admin/permissions-admin.module';
import { RolePermissionsModule } from './role-permissions/role-permissions.module';
import { AssetMaintenancePlansModule } from './asset-maintenance-plans/asset-maintenance-plans.module';
import { AssetMaintenanceRecordsModule } from './asset-maintenance-records/asset-maintenance-records.module';
import { AssetMaintenanceTypesModule } from './asset-maintenance-types/asset-maintenance-types.module';
import { HolidaysModule } from './holidays/holidays.module';
import { BrandCpuCompatibilityModule } from './asset-brand-cpu-compatibility/brand-cpu-compatibility.module';
import { BrandRamCompatibilityModule } from './asset-brand-ram-compatibility/brand-ram-compatibility.module';
import { BrandOsCompatibilityModule } from './asset-brand-os-compatibility/brand-os-compatibility.module';
import { TypeOsCompatibilityModule } from './asset-type-os-compatibility/type-os-compatibility.module';

// Entities
import { Site } from './entities/site.entity';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { UserSite } from './entities/user-site.entity';
import { UserSiteRole } from './entities/user-site-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { Asset } from './entities/asset.entity';
import { AssetType } from './entities/asset-type.entity';
import { AssetBrand } from './entities/asset-brand.entity';
import { AssetModel } from './entities/asset-model.entity';
import { AssetStatus } from './entities/asset-status.entity';
import { Section } from './entities/section.entity';
import { AssetOsFamily } from './entities/asset-os-family.entity';
import { AssetOsVersion } from './entities/asset-os-version.entity';
import { Employee } from './entities/employee.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';
import { AssetCpu } from './entities/asset-cpu.entity';
import { AssetRamOption } from './entities/asset-ram-option.entity';
import { StorageOption } from './entities/storage-option.entity';
import { CpuVendor } from './entities/asset-cpu-vendor.entity';
import { CpuSegment } from './entities/asset-cpu-segment.entity';
import { AssetRamMemoryType } from './entities/asset-ram-memory-type.entity';
import { AssetRamFormFactor } from './entities/asset-ram-form-factor.entity';
import { StorageDriveType } from './entities/asset-storage-drive-type.entity';
import { StorageInterface } from './entities/asset-storage-interface.entity';
import { StorageFormFactor } from './entities/asset-storage-form-factor.entity';
import { AssetBrandCpuCompatibility } from './entities/asset-brand-cpu-compatibility.entity';
import { AssetBrandRamCompatibility } from './entities/asset-brand-ram-compatibility.entity';
import { AssetBrandOsCompatibility } from './entities/asset-brand-os-compatibility.entity';
import { AssetTypeOsCompatibility } from './entities/asset-type-os-compatibility.entity';
import { AssetMaintenancePlan } from './entities/asset-maintenance-plan.entity';
import { AssetMaintenanceRecord } from './entities/asset-maintenance-record.entity';
import { AssetMaintenanceType } from './entities/asset-maintenance-type.entity';
import { Holiday } from './entities/holiday.entity';
import { LoginAttempt } from './entities/login-attempt.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'it_inventory',
      schema: process.env.DB_SCHEMA || 'public',
      entities: [
        Site,
        User,
        Role,
        Permission,
        UserRole,
        UserSite,
        UserSiteRole,
        RolePermission,
        Asset,
        AssetType,
        AssetStatus,
        AssetBrand,
        AssetModel,
        Section,
        AssetOsFamily,
        AssetOsVersion,
        Employee,
        AssetAssignment,
        AssetCpu,
        AssetRamOption,
        StorageOption,
        CpuVendor,
        CpuSegment,
        AssetRamMemoryType,
        AssetRamFormFactor,
        StorageDriveType,
        StorageInterface,
        StorageFormFactor,
        AssetBrandCpuCompatibility,
        AssetBrandRamCompatibility,
        AssetBrandOsCompatibility,
        AssetTypeOsCompatibility,
        AssetMaintenancePlan,
        AssetMaintenanceRecord,
        AssetMaintenanceType,
        Holiday,
        LoginAttempt,
        RefreshToken,
      ],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),
    SitesModule,
    AuthModule,
    AssetsModule,
    CatalogsModule,
    EmployeesModule,
    AssignmentsModule,
    AssetOsVersionsModule,
    AssetOsFamiliesModule,
    AssetModelsModule,
    AssetCpuModule,
    AssetRamModule,
    AssetBrandsModule,
    AssetTypesModule,
    AssetStatusesModule,
    SectionsModule,
    AssetCpuVendorsModule,
    AssetCpuSegmentsModule,
    AssetRamMemoryTypesModule,
    AssetRamFormFactorsModule,
    AssetStorageDriveTypesModule,
    AssetStorageInterfacesModule,
    AssetStorageFormFactorsModule,
    AssetStorageModule,
    UsersAdminModule,
    RolesAdminModule,
    PermissionsAdminModule,
    RolePermissionsModule,
    BrandCpuCompatibilityModule,
    BrandRamCompatibilityModule,
    BrandOsCompatibilityModule,
    TypeOsCompatibilityModule,
    AssetMaintenancePlansModule,
    AssetMaintenanceRecordsModule,
    AssetMaintenanceTypesModule,
    HolidaysModule,
  ],
})
export class AppModule {}
