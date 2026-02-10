import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Box,
  Users,
  ClipboardList,
  Settings,
  Building2,
  Wrench,
  Tag,
  CheckCircle2,
  Briefcase,
  Package,
  Monitor,
  Laptop,
  Building,
  Cpu,
  MemoryStick,
  HardDrive,
  Grid3x3,
  List,
  FileType,
  Shapes,
  Database,
  Cable,
  Square,
  Shield,
  UserCog,
  Key,
  Calendar,
} from 'lucide-react';
import { SuiteSidebar, SuiteSidebarItem, SuiteSidebarSection } from '@pot/ui-kit';
import { useAuthStore } from '@/store/authStore';
import { sitesService } from '@/services/sitesService';

const menuItems = [
  { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, permission: 'assets.read', wip: true },
  { id: 'assets', path: '/assets', label: 'Activos', icon: <Box className="h-5 w-5" />, permission: 'assets.read', wip: false },
  { id: 'employees', path: '/employees', label: 'Empleados', icon: <Users className="h-5 w-5" />, permission: 'employees.read', wip: false },
  { id: 'assignments', path: '/assignments', label: 'Asignaciones', icon: <ClipboardList className="h-5 w-5" />, permission: 'assignments.read', wip: false },
  { id: 'maintenance', path: '/maintenance', label: 'Mantenimientos', icon: <Wrench className="h-5 w-5" />, permission: 'assets.read', wip: false },
];

const catalogSubItems = [
  { id: 'asset-types', path: '/catalogs/asset-types', label: 'Tipos', icon: <Tag className="h-4 w-4" />, group: 'Activos', permission: 'assetTypes.read' },
  { id: 'asset-statuses', path: '/catalogs/asset-statuses', label: 'Estados', icon: <CheckCircle2 className="h-4 w-4" />, group: 'Activos', permission: 'assetTypes.read' },
  { id: 'asset-brands', path: '/catalogs/asset-brands', label: 'Marcas', icon: <Briefcase className="h-4 w-4" />, group: 'Activos', permission: 'assetBrands.read' },
  { id: 'asset-models', path: '/catalogs/asset-models', label: 'Modelos', icon: <Package className="h-4 w-4" />, group: 'Activos', permission: 'assetModels.read' },
  { id: 'os-families', path: '/catalogs/os-families', label: 'Familias S.O.', icon: <Monitor className="h-4 w-4" />, group: 'Sistema Operativo', permission: 'assetOsFamilies.read' },
  { id: 'os-versions', path: '/catalogs/os-versions', label: 'Versiones S.O.', icon: <Laptop className="h-4 w-4" />, group: 'Sistema Operativo', permission: 'osVersions.read' },
  { id: 'sections', path: '/catalogs/sections', label: 'Secciones', icon: <Building className="h-4 w-4" />, group: 'Organización', permission: 'sections.read' },
  { id: 'maintenance-types', path: '/catalogs/maintenance-types', label: 'Tipos mantenimiento', icon: <Wrench className="h-4 w-4" />, group: 'Mantenimiento', permission: 'maintenanceTypes.read' },
  { id: 'holidays', path: '/catalogs/holidays', label: 'Festivos', icon: <Calendar className="h-4 w-4" />, group: 'Mantenimiento', permission: 'holidays.read' },
  { id: 'cpu-vendors', path: '/catalogs/cpu-vendors', label: 'Vendedores', icon: <Building2 className="h-4 w-4" />, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  { id: 'cpu-segments', path: '/catalogs/cpu-segments', label: 'Segmentos', icon: <Grid3x3 className="h-4 w-4" />, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  { id: 'asset-cpu', path: '/catalogs/asset-cpu', label: 'Catálogo Completo', icon: <List className="h-4 w-4" />, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  { id: 'ram-memory-types', path: '/catalogs/ram-memory-types', label: 'Tipos Memoria', icon: <FileType className="h-4 w-4" />, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  { id: 'ram-form-factors', path: '/catalogs/ram-form-factors', label: 'Form Factors', icon: <Shapes className="h-4 w-4" />, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  { id: 'asset-ram', path: '/catalogs/asset-ram', label: 'Catálogo Completo', icon: <List className="h-4 w-4" />, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  { id: 'storage-drive-types', path: '/catalogs/storage-drive-types', label: 'Tipos Disco', icon: <Database className="h-4 w-4" />, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { id: 'storage-interfaces', path: '/catalogs/storage-interfaces', label: 'Interfaces', icon: <Cable className="h-4 w-4" />, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { id: 'storage-form-factors', path: '/catalogs/storage-form-factors', label: 'Form Factors', icon: <Square className="h-4 w-4" />, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { id: 'asset-storage', path: '/catalogs/asset-storage', label: 'Catálogo Completo', icon: <List className="h-4 w-4" />, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
];

const adminItems = [
  { id: 'admin-sites', path: '/admin/sites', label: 'Sedes', icon: <Building2 className="h-4 w-4" /> },
  { id: 'admin-users', path: '/admin/users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
  { id: 'admin-roles', path: '/admin/roles', label: 'Roles', icon: <UserCog className="h-4 w-4" /> },
  { id: 'admin-permissions', path: '/admin/permissions', label: 'Permisos', icon: <Key className="h-4 w-4" /> },
];

const groupIcons: Record<string, React.ReactNode> = {
  Activos: <Box className="h-4 w-4" />,
  'Sistema Operativo': <Monitor className="h-4 w-4" />,
  Organización: <Building className="h-4 w-4" />,
  Hardware: <Settings className="h-4 w-4" />,
  Mantenimiento: <Wrench className="h-4 w-4" />,
};

const hardwareSubgroupIcons: Record<string, React.ReactNode> = {
  CPU: <Cpu className="h-4 w-4" />,
  RAM: <MemoryStick className="h-4 w-4" />,
  Storage: <HardDrive className="h-4 w-4" />,
};

export default function Sidebar() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const user = useAuthStore((state) => state.user);
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const setSelectedSite = useAuthStore((state) => state.setSelectedSite);
  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesService.getAll,
  });

  const availableSites = sitesData?.data?.filter((site: any) => {
    const userSiteIds = user?.sites?.map((s) => s.siteId) || [];
    return userSiteIds.includes(site.siteId);
  }) || [];

  useEffect(() => {
    if (availableSites.length === 1 && !selectedSiteId) {
      setSelectedSite(availableSites[0].siteId);
    }
  }, [availableSites, selectedSiteId, setSelectedSite]);

  const showSiteSelector = availableSites.length > 1;

  const catalogItems = useMemo(() => {
    const permitted = catalogSubItems.filter((item) => hasPermission(item.permission));
    if (!permitted.length) return [] as SuiteSidebarItem[];

    const grouped = permitted.reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {} as Record<string, typeof catalogSubItems>);

    return Object.entries(grouped).map(([groupName, items]) => {
      if (groupName === 'Hardware') {
        const subgrouped = items.reduce((acc, item) => {
          const subgroup = item.subgroup || 'Otros';
          if (!acc[subgroup]) acc[subgroup] = [];
          acc[subgroup].push(item);
          return acc;
        }, {} as Record<string, typeof items>);

        const subgroupItems: SuiteSidebarItem[] = Object.entries(subgrouped).map(
          ([subgroupName, subItems]) => ({
            id: `catalog-${groupName}-${subgroupName}`,
            label: subgroupName,
            icon: hardwareSubgroupIcons[subgroupName] || <Settings className="h-4 w-4" />,
            children: subItems.map((sub) => ({
              id: `catalog-${sub.id}`,
              label: sub.label,
              path: sub.path,
              icon: sub.icon,
            })),
          })
        );

        return {
          id: `catalog-${groupName}`,
          label: groupName,
          icon: groupIcons[groupName] || <Settings className="h-4 w-4" />,
          children: subgroupItems,
        } satisfies SuiteSidebarItem;
      }

      return {
        id: `catalog-${groupName}`,
        label: groupName,
        icon: groupIcons[groupName] || <Settings className="h-4 w-4" />,
        children: items.map((sub) => ({
          id: `catalog-${sub.id}`,
          label: sub.label,
          path: sub.path,
          icon: sub.icon,
        })),
      } satisfies SuiteSidebarItem;
    });
  }, [hasPermission]);

  const sections = useMemo<SuiteSidebarSection[]>(() => {
    const items: SuiteSidebarItem[] = menuItems
      .filter((item) => hasPermission(item.permission))
      .map((item) => ({
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.icon,
        badge: item.wip ? 'WIP' : undefined,
      }));

    if (catalogItems.length > 0) {
      items.push({
        id: 'catalogs',
        label: 'Catálogos',
        icon: <Settings className="h-5 w-5" />,
        children: catalogItems,
      });
    }

    if (hasPermission('system.read')) {
      items.push({
        id: 'admin',
        label: 'Administración',
        icon: <Shield className="h-5 w-5" />,
        children: adminItems.map((adminItem) => ({
          id: adminItem.id,
          label: adminItem.label,
          path: adminItem.path,
          icon: adminItem.icon,
        })),
      });
    }

    return [
      {
        id: 'main',
        items,
      },
    ];
  }, [catalogItems, hasPermission]);

  const header = showSiteSelector ? (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-white">
        <Building2 className="h-4 w-4 inline mr-2" />
        Sede
      </label>
      <div className="flex gap-2">
        <select
          value={selectedSiteId || ''}
          onChange={(e) =>
            setSelectedSite(e.target.value ? parseInt(e.target.value) : null)
          }
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos mis sites</option>
          {availableSites.map((site: any) => (
            <option key={site.siteId} value={site.siteId}>
              [{site.siteId}] {site.code}
            </option>
          ))}
        </select>
        {selectedSiteId && (
          <button
            onClick={() => setSelectedSite(null)}
            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition-colors dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 dark:border-red-800"
            title="Limpiar selección"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  ) : availableSites.length === 1 ? (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-white">
        <Building2 className="h-4 w-4 inline mr-2" />
        Sede
      </label>
      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 font-medium">
        [{availableSites[0].siteId}] {availableSites[0].code}
      </div>
    </div>
  ) : null;

  return (
    <SuiteSidebar
      sections={sections}
      header={header}
      className={location.pathname.startsWith('/catalogs') ? 'pot-sidebar-catalogs-open' : ''}
    />
  );
}
