import { useState, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { sitesService } from '@/services/sitesAdminService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import SiteForm from '@/components/forms/admin/SiteForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function SitesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.permissions?.includes('system.admin') || false;

  const { data } = useQuery({
    queryKey: ['sites-admin', filters],
    queryFn: () => sitesService.getAll(),
  });

  // Filtrar sites según los sites del usuario
  const filteredByUserSites = useMemo(() => {
    if (!data?.data) return [];
    
    // Si es admin, ver todos
    if (canManage) {
      return data.data;
    }
    
    // Si no, solo sus sites asignados
    const userSiteIds = user?.sites?.map(s => s.siteId) || [];
    return data.data.filter((site: any) => userSiteIds.includes(site.siteId));
  }, [data, canManage, user?.sites]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
  };

  const handleSiteClick = (siteId: number) => {
    setSelectedSiteId(siteId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
  };

  const handleDetailsClose = () => {
    setSelectedSiteId(null);
    setModalHeaderButtons(null);
  };

  const handleDetailsHeaderButtons = (buttons: React.ReactNode) => {
    setModalHeaderButtons(buttons);
  };

  const handleExport = async () => {
    try {
      const blob = await sitesService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sites_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Sites exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await sitesService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_sites.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Plantilla descargada exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al descargar plantilla');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await sitesService.importFromExcel(file);
      
      if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
        if (result.data.errores.length > 5) {
          toast.error(`...y ${result.data.errores.length - 5} errores más`);
        }
      }
      
      if (result.data?.insertados > 0) {
        toast.success(`${result.data.insertados} sites creados exitosamente`);
      }
      
      if (result.data?.duplicados > 0) {
        toast(`${result.data.duplicados} sites duplicados omitidos`, { icon: 'ℹ️' });
      }
      
      queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar archivo');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  // Aplicar filtros de estado
  const filteredData = filteredByUserSites?.filter((site: any) => {
    if (filters.isActive === 'true') return site.isActive === true;
    if (filters.isActive === 'false') return site.isActive === false;
    return true;
  });

  const filterConfigs: FilterConfig[] = [
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' },
      ],
    },
  ];

  const columns: Column<any>[] = [
    {
      key: 'siteId',
      label: 'ID',
      width: '8%',
      sortable: true,
      render: (site) => site.siteId || '-',
    },
    {
      key: 'code',
      label: 'Código',
      width: '15%',
      sortable: true,
      render: (site) => (
        <button
          onClick={() => handleSiteClick(site.siteId)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del site"
        >
          {site.code || '-'}
        </button>
      ),
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '25%',
      sortable: true,
      render: (site) => site.name || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (site) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            site.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {site.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '12%',
      sortable: true,
      render: (site) => (site.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (site) => (site.createdAt ? new Date(site.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Sedes
        </h1>

        <div className="flex items-center gap-3">
          <ActionButton
            variant="refresh"
            icon={RefreshCw}
            onClick={handleRefresh}
            title="Refrescar datos"
          >
            Refrescar
          </ActionButton>

          <ActionButton
            variant="export"
            icon={Download}
            onClick={handleExport}
            title="Exportar a Excel"
          >
            Exportar
          </ActionButton>

          {canManage && (
            <>
              <ActionButton variant="template" icon={FileText} onClick={handleDownloadTemplate}>
                Plantilla
              </ActionButton>
              <ActionButton variant="import" icon={Upload} onClick={handleImport}>
                Importar
              </ActionButton>
              <ActionButton variant="create" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                Nuevo Site
              </ActionButton>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <DataTableFilters
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
      />

      <div className="card">
        <DataTable
          columns={columns}
          data={filteredData || []}
          keyExtractor={(site: any) => site.siteId}
          emptyMessage="No hay sites registrados"
        />
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Site"
        size="lg"
      >
        <SiteForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={selectedSiteId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Site"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        {selectedSiteId && (
          <SiteForm
            mode="edit"
            siteId={selectedSiteId}
            onSuccess={handleUpdateSuccess}
            onCancel={handleDetailsClose}
            onHeaderButtons={handleDetailsHeaderButtons}
          />
        )}
      </Modal>
    </div>
  );
}
