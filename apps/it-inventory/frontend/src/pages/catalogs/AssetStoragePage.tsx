import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetStorageService } from '@/services/assetStorageService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';
import AssetStorageForm from '@/components/forms/catalogs/AssetStorageForm';

export default function AssetStoragePage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-storage', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return AssetStorageService.getAll({ isActive, siteId: selectedSiteId || undefined });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-storage'] });
    queryClient.invalidateQueries({ queryKey: ['storage-drive-types'] });
    queryClient.invalidateQueries({ queryKey: ['storage-interfaces'] });
    queryClient.invalidateQueries({ queryKey: ['storage-form-factors'] });
    toast.success('Datos actualizados');
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleStorageClick = (storageId: number) => {
    setSelectedStorageId(storageId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedStorageId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await AssetStorageService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'almacenamiento.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Listado de almacenamiento exportado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AssetStorageService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'almacenamiento-template.xlsx';
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
      const result = await AssetStorageService.importFromExcel(file);
      
      // Manejar duplicados
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} opciones creadas. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} opciones duplicadas. Revisa el modal para decidir si actualizar.`);
        }
      } else if (result.data?.errores && result.data.errores.length > 0) {
        // Mostrar errores específicos en toasts
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
        if (result.data.errores.length > 5) {
          toast.error(`...y ${result.data.errores.length - 5} errores más`);
        }
      } else if (result.data?.insertados > 0) {
        toast.success(`${result.data.insertados} opciones creadas exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-storage'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar archivo');
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateDuplicates = async () => {
    if (!duplicatesData) return;

    try {
      const result = await AssetStorageService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} opciones actualizadas`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-storage'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar duplicados');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '5%',
      sortable: true,
      render: (storage) => storage.id || '-',
    },
    {
      key: 'capacityGb',
      label: 'Capacidad (GB)',
      width: '10%',
      sortable: true,
      render: (storage) => (
        <button
          onClick={() => handleStorageClick(storage.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del almacenamiento"
        >
          {storage.capacityGb} GB
        </button>
      ),
    },
    {
      key: 'driveType',
      label: 'Tipo Disco',
      width: '10%',
      sortable: true,
      sortValue: (storage) => storage.driveType?.name || '',
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (storage) => storage.driveType?.name || '-',
    },
    {
      key: 'interface',
      label: 'Interfaz',
      width: '10%',
      sortable: true,
      sortValue: (storage) => storage.interface?.name || '',
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (storage) => storage.interface?.name || '-',
    },
    {
      key: 'formFactor',
      label: 'Form Factor',
      width: '10%',
      sortable: true,
      sortValue: (storage) => storage.formFactor?.name || '',
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (storage) => storage.formFactor?.name || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '8%',
      sortable: true,
      render: (storage) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            storage.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {storage.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '12%',
      sortable: true,
      render: (storage) => (storage.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (storage) => (storage.createdAt ? new Date(storage.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Catálogo de Almacenamiento
        </h1>
        <div className="flex items-center gap-3">
          <ActionButton
            variant="refresh"
            icon={RefreshCw}
            onClick={handleRefresh}
            title="Refrescar página"
          >
            Refrescar
          </ActionButton>
          {canManageResource && (
            <>
              <ActionButton
                variant="template"
                icon={FileText}
                onClick={handleDownloadTemplate}
                title="Descargar plantilla Excel"
              >
                Plantilla
              </ActionButton>
              <ActionButton
                variant="export"
                icon={Download}
                onClick={handleExport}
                title="Exportar a Excel"
              >
                Exportar
              </ActionButton>
              <ActionButton
                variant="import"
                icon={Upload}
                onClick={handleImport}
                title="Importar desde Excel"
              >
                Importar
              </ActionButton>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <ActionButton
                variant="create"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
                title="Crear nueva opción de almacenamiento"
              >
                Nuevo Almacenamiento
              </ActionButton>
            </>
          )}
        </div>
      </div>

      {/* Filtros */}
      <DataTableFilters
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
      />

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando catálogo de almacenamiento...</p>
          </div>
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
            keyExtractor={(storage) => storage.id}
            emptyMessage="No se encontraron opciones de almacenamiento"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear Almacenamiento */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Opción de Almacenamiento"
        size="xxl"
      >
        <AssetStorageForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Almacenamiento */}
      <Modal
        isOpen={selectedStorageId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Almacenamiento"
        size="xxl"
        headerActions={modalHeaderButtons}
      >
        {selectedStorageId && (
          <AssetStorageForm
            mode="edit"
            storageId={selectedStorageId}
            onSuccess={handleDetailsClose}
            onCancel={handleDetailsClose}
            onHeaderButtons={setModalHeaderButtons}
          />
        )}
      </Modal>

      {/* Modal Duplicados */}
      <DuplicatesModal
        isOpen={!!duplicatesData && duplicatesData.length > 0}
        onClose={() => setDuplicatesData(null)}
        onConfirm={handleUpdateDuplicates}
        duplicates={duplicatesData || []}
        title="Opciones de Almacenamiento Duplicadas Detectadas"
        message="Las siguientes opciones de almacenamiento ya existen en la base de datos. ¿Deseas actualizarlas con los datos del Excel?"
        columns={[
          { key: 'fila', label: 'Fila' },
          { key: 'Capacidad (GB)', label: 'Capacidad (GB)' },
          { key: 'Tipo Disco', label: 'Tipo Disco' },
          { key: 'Interfaz', label: 'Interfaz' },
          { key: 'Form Factor', label: 'Form Factor' },
          { key: 'idExistente', label: 'ID Existente' },
        ]}
      />
    </div>
  );
}
