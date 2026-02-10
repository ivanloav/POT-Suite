import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import usersAdminService from '@/services/usersAdminService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import UserForm from '@/components/forms/admin/UserForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManage = user?.permissions?.includes('system.admin') || false;

  const { data, isLoading } = useQuery({
    queryKey: ['users-admin', filters],
    queryFn: () => usersAdminService.getAll(),
  });

  const filteredData = data?.filter(user => {
    if (filters.isActive === 'active') return user.isActive === true;
    if (filters.isActive === 'inactive') return user.isActive === false;
    return true;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['users-admin'] });
  };

  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['users-admin'] });
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['users-admin'] });
  };

  const handleDetailsClose = () => {
    setSelectedUserId(null);
    setModalHeaderButtons(null);
  };

  const handleDetailsHeaderButtons = (buttons: React.ReactNode) => {
    setModalHeaderButtons(buttons);
  };

  const handleExport = async () => {
    try {
      const blob = await usersAdminService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Usuarios exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await usersAdminService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template_users.xlsx';
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
      const result = await usersAdminService.importFromExcel(file);
      
      if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
      }

      toast.success(result.message || 'Usuarios importados exitosamente');
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
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
      key: 'userName',
      label: 'Nombre de Usuario',
      sortable: true,
      render: (item) => (
        <button
          onClick={() => handleUserClick(item.id)}
          className="text-blue-600 dark:text-blue-400 hover:underline text-left"
        >
          {item.userName}
        </button>
      ),
    },
    {
      key: 'email',
      label: 'Email',
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuarios</h1>
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
                Nuevo Usuario
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
            <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
          </div>
        ) : (
          <DataTable
            data={filteredData || []}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No hay usuarios registrados"
          />
        )}
      </div>

      {/* Modal Crear Usuario */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Usuario"
        size="lg"
      >
        <UserForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Usuario */}
      <Modal
        isOpen={selectedUserId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Usuario"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        {selectedUserId && (
          <UserForm
            mode="edit"
            userId={selectedUserId}
            onSuccess={handleUpdateSuccess}
            onCancel={handleDetailsClose}
            onHeaderButtons={handleDetailsHeaderButtons}
          />
        )}
      </Modal>
    </div>
  );
}
