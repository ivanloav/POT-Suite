import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import rolesAdminService from '@/services/rolesAdminService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import RoleForm from '@/components/forms/admin/RoleForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function RolesPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.permissions?.includes('system.admin') || false;

  const { data, isLoading } = useQuery({
    queryKey: ['roles-admin', filters],
    queryFn: () => rolesAdminService.getAll(),
  });

  const filteredData = data?.filter(role => {
    if (filters.isActive === 'active') return role.isActive === true;
    if (filters.isActive === 'inactive') return role.isActive === false;
    return true;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
  };

  const handleRoleClick = (roleId: number) => {
    setSelectedRoleId(roleId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
  };

  const handleDetailsClose = () => {
    setSelectedRoleId(null);
    setModalHeaderButtons(null);
  };

  const handleDetailsHeaderButtons = (buttons: React.ReactNode) => {
    setModalHeaderButtons(buttons);
  };

  const handleExport = async () => {
    try {
      const blob = await rolesAdminService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roles_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Roles exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await rolesAdminService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_roles.xlsx';
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
      const result = await rolesAdminService.importFromExcel(file);
      
      if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
      }

      toast.success(result.message || 'Roles importados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
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
          onClick={() => handleRoleClick(item.id)}
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roles</h1>
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
                Nuevo Rol
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
            <p className="text-gray-600 dark:text-gray-400">Cargando roles...</p>
          </div>
        ) : (
          <DataTable
            data={filteredData || []}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No hay roles registrados"
          />
        )}
      </div>

      {/* Modal Crear Rol */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Rol"
        size="lg"
      >
        <RoleForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Rol */}
      <Modal
        isOpen={selectedRoleId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Rol"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        {selectedRoleId && (
          <RoleForm
            mode="edit"
            roleId={selectedRoleId}
            onSuccess={handleUpdateSuccess}
            onCancel={handleDetailsClose}
            onHeaderButtons={handleDetailsHeaderButtons}
          />
        )}
      </Modal>
    </div>
  );
}
