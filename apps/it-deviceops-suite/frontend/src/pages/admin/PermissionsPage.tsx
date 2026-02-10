import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import permissionsAdminService from '@/services/permissionsAdminService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import PermissionForm from '@/components/forms/admin/PermissionForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.permissions?.includes('system.admin') || false;

  const { data, isLoading } = useQuery({
    queryKey: ['permissions-admin', filters],
    queryFn: () => permissionsAdminService.getAll(),
  });

  const filteredData = data?.filter(permission => {
    if (filters.isActive === 'active') return permission.isActive === true;
    if (filters.isActive === 'inactive') return permission.isActive === false;
    return true;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
  };

  const handlePermissionClick = (permissionId: number) => {
    setSelectedPermissionId(permissionId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
  };

  const handleDetailsClose = () => {
    setSelectedPermissionId(null);
    setModalHeaderButtons(null);
  };

  const handleDetailsHeaderButtons = (buttons: React.ReactNode) => {
    setModalHeaderButtons(buttons);
  };

  const handleExport = async () => {
    try {
      const blob = await permissionsAdminService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `permissions_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Permisos exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await permissionsAdminService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_permissions.xlsx';
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
      const result = await permissionsAdminService.importFromExcel(file);
      
      if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
      }

      toast.success(result.message || 'Permisos importados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters(newFilters as { isActive?: string });
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
      options: [
        { value: '', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'inactive', label: 'Inactivos' },
      ],
    },
  ];

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '8%',
      sortable: true,
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (item) => (
        <button
          onClick={() => handlePermissionClick(item.id)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-left"
        >
          {item.name}
        </button>
      ),
    },
    {
      key: 'code',
      label: 'Código',
      sortable: true,
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {item.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '12%',
      sortable: true,
      render: (item) => (item.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Permisos</h1>
        <div className="flex items-center gap-3">
          <ActionButton variant="refresh" icon={RefreshCw} onClick={handleRefresh}>
            Refrescar
          </ActionButton>
          <ActionButton variant="export" icon={Download} onClick={handleExport}>
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
                Nuevo Permiso
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

      <DataTableFilters filters={filterConfigs} onFilterChange={handleFilterChange} />

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando permisos...</p>
          </div>
        ) : (
          <DataTable
            data={filteredData || []}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No hay permisos registrados"
          />
        )}
      </div>

      {/* Modal Crear Permiso */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Permiso"
        size="lg"
      >
        <PermissionForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Permiso */}
      <Modal
        isOpen={selectedPermissionId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Permiso"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        {selectedPermissionId && (
          <PermissionForm
            mode="edit"
            permissionId={selectedPermissionId}
            onSuccess={handleUpdateSuccess}
            onCancel={handleDetailsClose}
            onHeaderButtons={handleDetailsHeaderButtons}
          />
        )}
      </Modal>
    </div>
  );
}
