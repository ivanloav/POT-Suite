import { NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Box,
  Users,
  ClipboardList,
  Settings,
  Building2,
  Wrench,
  X,
  ChevronRight,
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
  Building2 as Factory,
  Grid3x3,
  List,
  FileType,
  Shapes,
  Database,
  Cable,
  Square,
  Shield,
  Users as UsersIcon,
  UserCog,
  Key,
  Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { sitesService } from '@/services/sitesService';
import React, { useState, useEffect } from 'react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'assets.read', wip: true },
  { path: '/assets', label: 'Activos', icon: Box, permission: 'assets.read', wip: false },
  { path: '/employees', label: 'Empleados', icon: Users, permission: 'employees.read', wip: false },
  { path: '/assignments', label: 'Asignaciones', icon: ClipboardList, permission: 'assignments.read', wip: false },
  { path: '/maintenance', label: 'Mantenimientos', icon: Wrench, permission: 'assets.read', wip: false },
  { path: '/catalogs', label: 'Catálogos', icon: Settings, permission: 'assetTypes.read', wip: false },
  { path: '/admin', label: 'Administración', icon: Shield, permission: 'system.read', wip: false },
];

const catalogSubItems = [
  // Catálogos de Activos
  { path: '/catalogs/asset-types', label: 'Tipos', icon: Tag, wip: false, group: 'Activos', permission: 'assetTypes.read' },
  { path: '/catalogs/asset-statuses', label: 'Estados', icon: CheckCircle2, wip: false, group: 'Activos', permission: 'assetStatuses.read' }, // Temporal: usa assetTypes.read hasta agregar el permiso
  { path: '/catalogs/asset-brands', label: 'Marcas', icon: Briefcase, wip: false, group: 'Activos', permission: 'assetBrands.read' },
  { path: '/catalogs/asset-models', label: 'Modelos', icon: Package, wip: false, group: 'Activos', permission: 'assetModels.read' },
  
  // Sistema Operativo
  { path: '/catalogs/os-families', label: 'Familias S.O.', icon: Monitor, wip: false, group: 'Sistema Operativo', permission: 'assetOsFamilies.read' },
  { path: '/catalogs/os-versions', label: 'Versiones S.O.', icon: Laptop, wip: false, group: 'Sistema Operativo', permission: 'osVersions.read' },
  
  // Organización
  { path: '/catalogs/sections', label: 'Secciones', icon: Building, wip: false, group: 'Organización', permission: 'sections.read' },

  // Mantenimiento
  { path: '/catalogs/maintenance-types', label: 'Tipos mantenimiento', icon: Wrench, wip: false, group: 'Mantenimiento', permission: 'maintenanceTypes.read' },
  { path: '/catalogs/holidays', label: 'Festivos', icon: Calendar, wip: false, group: 'Mantenimiento', permission: 'holidays.read' },
  
  // Hardware - CPU (todos usan assetCPU.read porque son parte del mismo módulo)
  { path: '/catalogs/cpu-vendors', label: 'Vendedores', icon: Factory, wip: false, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  { path: '/catalogs/cpu-segments', label: 'Segmentos', icon: Grid3x3, wip: false, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  { path: '/catalogs/asset-cpu', label: 'Catálogo Completo', icon: List, wip: false, group: 'Hardware', subgroup: 'CPU', permission: 'assetCPU.read' },
  
  // Hardware - RAM (todos usan assetRAM.read porque son parte del mismo módulo)
  { path: '/catalogs/ram-memory-types', label: 'Tipos Memoria', icon: FileType, wip: false, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  { path: '/catalogs/ram-form-factors', label: 'Form Factors', icon: Shapes, wip: false, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  { path: '/catalogs/asset-ram', label: 'Catálogo Completo', icon: List, wip: false, group: 'Hardware', subgroup: 'RAM', permission: 'assetRAM.read' },
  
  // Hardware - Storage (todos usan assetStorage.read porque son parte del mismo módulo)
  { path: '/catalogs/storage-drive-types', label: 'Tipos Disco', icon: Database, wip: false, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { path: '/catalogs/storage-interfaces', label: 'Interfaces', icon: Cable, wip: false, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { path: '/catalogs/storage-form-factors', label: 'Form Factors', icon: Square, wip: false, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
  { path: '/catalogs/asset-storage', label: 'Catálogo Completo', icon: List, wip: false, group: 'Hardware', subgroup: 'Storage', permission: 'assetStorage.read' },
];

// Iconos para grupos principales
const groupIcons: Record<string, any> = {
  'Activos': Box,
  'Sistema Operativo': Monitor,
  'Organización': Building,
  'Hardware': Settings,
  'Mantenimiento': Wrench,
};

// Iconos para subgrupos de Hardware
const hardwareSubgroupIcons: Record<string, any> = {
  'CPU': Cpu,
  'RAM': MemoryStick,
  'Storage': HardDrive,
};

// Items de Administración (solo visible para admin)
const adminItems = [
  { path: '/admin/sites', label: 'Sedes', icon: Building2, wip: false },
  { path: '/admin/users', label: 'Usuarios', icon: UsersIcon, wip: false },
  { path: '/admin/roles', label: 'Roles', icon: UserCog, wip: false },
  { path: '/admin/permissions', label: 'Permisos', icon: Key, wip: false },
];

export default function Sidebar() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const user = useAuthStore((state) => state.user);
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const setSelectedSite = useAuthStore((state) => state.setSelectedSite);
  const location = useLocation();
  
  // Verificar si la ruta actual está en catálogos o admin al inicializar
  const isInCatalogs = location.pathname.startsWith('/catalogs');
  const isInAdmin = location.pathname.startsWith('/admin');
  const [catalogsOpen, setCatalogsOpen] = useState(isInCatalogs);
  const [adminOpen, setAdminOpen] = useState(isInAdmin);
  
  // Estado para controlar qué grupos están abiertos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Activos': false,
    'Sistema Operativo': false,
    'Organización': false,
    'Hardware': false,
    'Mantenimiento': false,
  });
  
  // Estado para controlar qué subgrupos de Hardware están abiertos
  const [openHardwareSubgroups, setOpenHardwareSubgroups] = useState<Record<string, boolean>>({
    'CPU': false,
    'RAM': false,
    'Storage': false,
  });

  // Mantener abierto si navegamos a una ruta de catálogos o admin
  useEffect(() => {
    if (location.pathname.startsWith('/catalogs')) {
      setCatalogsOpen(true);
      
      // Abrir el grupo correspondiente
      const matchedItem = catalogSubItems.find(item => location.pathname.startsWith(item.path));
      if (matchedItem) {
        setOpenGroups(prev => ({ ...prev, [matchedItem.group]: true }));
        
        // Si es Hardware, abrir el subgrupo correspondiente
        if (matchedItem.group === 'Hardware' && matchedItem.subgroup) {
          setOpenHardwareSubgroups(prev => ({ ...prev, [matchedItem.subgroup!]: true }));
        }
      }
    } else if (location.pathname.startsWith('/admin')) {
      setAdminOpen(true);
    }
  }, [location.pathname]);

  const toggleGroup = (group: string) => {
    // Comportamiento de acordeón: cerrar todos los otros grupos del mismo nivel
    const newState: Record<string, boolean> = {};
    Object.keys(openGroups).forEach(key => {
      newState[key] = key === group ? !openGroups[group] : false;
    });
    setOpenGroups(newState);
  };

  const toggleHardwareSubgroup = (subgroup: string) => {
    // Comportamiento de acordeón: cerrar todos los otros subgrupos
    const newState: Record<string, boolean> = {};
    Object.keys(openHardwareSubgroups).forEach(key => {
      newState[key] = key === subgroup ? !openHardwareSubgroups[subgroup] : false;
    });
    setOpenHardwareSubgroups(newState);
  };
  
  // Agrupar items por grupo (solo los que el usuario tiene permiso)
  const groupedItems = catalogSubItems
    .filter(item => hasPermission(item.permission))
    .reduce((acc, item) => {
      if (!acc[item.group]) acc[item.group] = [];
      acc[item.group].push(item);
      return acc;
    }, {} as Record<string, typeof catalogSubItems>);
  
  // Agrupar items de Hardware por subgrupo (solo los que el usuario tiene permiso)
  const hardwareSubgroups = catalogSubItems
    .filter(item => item.group === 'Hardware' && item.subgroup && hasPermission(item.permission))
    .reduce((acc, item) => {
      if (!acc[item.subgroup!]) acc[item.subgroup!] = [];
      acc[item.subgroup!].push(item);
      return acc;
    }, {} as Record<string, typeof catalogSubItems>);

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesService.getAll,
  });

  // Filtrar sites según los sites del usuario
  const availableSites = sitesData?.data?.filter((site: any) => {
    const userSiteIds = user?.sites?.map(s => s.siteId) || [];
    return userSiteIds.includes(site.siteId);
  }) || [];

  // Auto-seleccionar si solo tiene 1 site asignado
  useEffect(() => {
    if (availableSites.length === 1 && !selectedSiteId) {
      setSelectedSite(availableSites[0].siteId);
    }
  }, [availableSites, selectedSiteId, setSelectedSite]);

  // Si solo tiene 1 site, no mostrar el selector
  const showSiteSelector = availableSites.length > 1;

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col overflow-y-auto">
      {/* Site Selector */}
      {showSiteSelector && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            <Building2 className="h-4 w-4 inline mr-2" />
            Sede
          </label>
          <div className="flex gap-2">
            <select
              value={selectedSiteId || ''}
              onChange={(e) => setSelectedSite(e.target.value ? parseInt(e.target.value) : null)}
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
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      )}

      {!showSiteSelector && availableSites.length === 1 && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
            <Building2 className="h-4 w-4 inline mr-2" />
            Sede
          </label>
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 font-medium">
            [{availableSites[0].siteId}] {availableSites[0].code}
          </div>
        </div>
      )}

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (item.label === 'Catálogos') {
            if (!hasPermission(item.permission)) return null;
            const isSubActive = catalogSubItems.some(sub => location.pathname.startsWith(sub.path));
            return (
              <div key="catalogs">
                <button
                  type="button"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full transition-colors ${
                    isSubActive 
                      ? 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' 
                      : catalogsOpen 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setCatalogsOpen((open) => !open)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex items-center gap-2">
                    Catálogos
                    {item.wip && (
                      <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                        🚧 WIP
                      </span>
                    )}
                  </span>
                  <span className="ml-auto flex items-center">
                    <ChevronRight className={`h-5 w-5 transition-transform ${catalogsOpen ? 'rotate-90' : ''}`} />
                  </span>
                </button>
                {catalogsOpen && (
                  <div className="ml-2 mt-2 space-y-3">
                    {Object.entries(groupedItems).map(([groupName, items]) => (
                      <div key={groupName} className="space-y-1">
                        <button
                          type="button"
                          className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          onClick={() => toggleGroup(groupName)}
                        >
                          <div className="flex items-center gap-2">
                            {groupIcons[groupName] && React.createElement(groupIcons[groupName], { className: 'h-4 w-4' })}
                            <span>{groupName}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 transition-transform ${openGroups[groupName] ? 'rotate-90' : ''}`} />
                        </button>
                        {openGroups[groupName] && (
                          <div className="ml-2 space-y-1">
                            {groupName === 'Hardware' ? (
                              // Hardware con subgrupos (CPU, RAM, Storage)
                              Object.entries(hardwareSubgroups).map(([subgroupName, subItems]) => (
                                <div key={subgroupName} className="space-y-1">
                                  <button
                                    type="button"
                                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                    onClick={() => toggleHardwareSubgroup(subgroupName)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {hardwareSubgroupIcons[subgroupName] && React.createElement(hardwareSubgroupIcons[subgroupName], { className: 'h-3.5 w-3.5' })}
                                      <span className="tracking-wide">{subgroupName}</span>
                                    </div>
                                    <ChevronRight className={`h-3 w-3 transition-transform ${openHardwareSubgroups[subgroupName] ? 'rotate-90' : ''}`} />
                                  </button>
                                  {openHardwareSubgroups[subgroupName] && (
                                    <div className="ml-4 space-y-1">
                                      {subItems.map((sub) => (
                                        <NavLink
                                          key={sub.path}
                                          to={sub.path}
                                          className={({ isActive }) =>
                                            `flex items-center justify-between px-3 py-2 rounded transition-colors text-sm ${
                                              isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`
                                          }
                                        >
                                          <div className="flex items-center gap-2">
                                            {sub.icon && <sub.icon className="h-4 w-4" />}
                                            <span>{sub.label}</span>
                                          </div>
                                          {sub.wip && (
                                            <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                                              🚧 WIP
                                            </span>
                                          )}
                                        </NavLink>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              // Otros grupos sin subgrupos
                              items.map((sub) => (
                                <NavLink
                                  key={sub.path}
                                  to={sub.path}
                                  className={({ isActive }) =>
                                    `flex items-center justify-between px-3 py-2 rounded transition-colors text-sm ${
                                      isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`
                                  }
                                >
                                  <div className="flex items-center gap-2">
                                    {sub.icon && <sub.icon className="h-4 w-4" />}
                                    <span>{sub.label}</span>
                                  </div>
                                  {sub.wip && (
                                    <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                                      🚧 WIP
                                    </span>
                                  )}
                                </NavLink>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          
          // Administración (con dropdown)
          if (item.path === '/admin') {
            if (!hasPermission(item.permission)) return null;
            const isSubActive = adminItems.some(sub => location.pathname === sub.path);
            return (
              <div key={item.path}>
                <button
                  onClick={() => {
                    setAdminOpen(!adminOpen);
                    if (!adminOpen) setCatalogsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    isSubActive
                      ? 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      : adminOpen
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.wip && (
                      <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                        🚧 WIP
                      </span>
                    )}
                    <ChevronRight className={`h-5 w-5 transition-transform ${adminOpen ? 'rotate-90' : ''}`} />
                  </div>
                </button>

                {adminOpen && (
                  <div className="pl-8 pr-4 py-2 space-y-1">
                    {adminItems.map((adminItem) => (
                      <NavLink
                        key={adminItem.path}
                        to={adminItem.path}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3 py-2 rounded transition-colors text-sm ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`
                        }
                      >
                        <div className="flex items-center gap-2">
                          {adminItem.icon && <adminItem.icon className="h-4 w-4" />}
                          <span>{adminItem.label}</span>
                        </div>
                        {adminItem.wip && (
                          <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                            🚧 WIP
                          </span>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          
          if (!hasPermission(item.permission)) return null;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.wip && (
                <span className="px-1.5 py-0.5 text-xs font-bold rounded" style={{ backgroundColor: '#ffa200ff', color: '#fff' }}>
                  🚧 WIP
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
