import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetTypeService } from '@/services/assetTypeService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import AssetTypeForm from '@/components/forms/catalogs/AssetTypeForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function AssetTypesPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-types', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return assetTypeService.getAll({ isActive });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-types'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleTypeClick = (typeId: number) => {
    setSelectedTypeId(typeId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedTypeId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await assetTypeService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asset-types.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Tipos exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await assetTypeService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asset-types-template.xlsx';
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
      const result = await assetTypeService.importFromExcel(file);
      
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} tipos creados. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} tipos duplicados. Revisa el modal para decidir si actualizar.`);
        }
      } else if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
        if (result.data.errores.length > 5) {
          toast.error(`...y ${result.data.errores.length - 5} errores más`);
        }
      } else if (result.data?.insertados > 0) {
        toast.success(`${result.data.insertados} tipos creados exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al importar archivo');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateDuplicates = async () => {
    if (!duplicatesData) return;

    try {
      const result = await assetTypeService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} tipos actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
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
      render: (type) => type.id || '-',
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '30%',
      sortable: true,
      render: (type) => (
        <button
          onClick={() => handleTypeClick(type.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del tipo"
        >
          {type.name || '-'}
        </button>
      ),
    },
    {
      key: 'sortOrder',
      label: 'Orden',
      width: '10%',
      sortable: true,
      render: (type) => type.sortOrder || 0,
    },
    {
      key: 'isAssignable',
      label: 'Asignable',
      width: '12%',
      sortable: true,
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            type.isAssignable
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {type.isAssignable ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'supportsOs',
      label: 'Soporta OS',
      width: '12%',
      sortable: true,
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            type.supportsOs
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {type.supportsOs ? 'Sí' : 'No'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            type.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {type.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '12%',
      sortable: true,
      render: (type) => (type.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (type) => (type.createdAt ? new Date(type.createdAt).toLocaleString('es-ES') : '-'),
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
          Tipos de activos
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
                title="Crear nuevo tipo"
              >
                Nuevo tipo
              </ActionButton>
            </>
          )}
        </div>
      </div>

      <DataTableFilters
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
      />

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando tipos de activos...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            keyExtractor={(row) => row.id.toString()}
            emptyMessage="No hay tipos de activos registrados"
          />
        )}
      </div>

      {/* Modal de creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear nuevo tipo de activo"
        size="lg"
      >
        <AssetTypeForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        isOpen={selectedTypeId !== null}
        onClose={handleDetailsClose}
        title="Detalles del tipo de activo"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        <AssetTypeForm
          mode="edit"
          typeId={selectedTypeId || undefined}
          onSuccess={handleDetailsClose}
          onCancel={handleDetailsClose}
          onHeaderButtons={setModalHeaderButtons}
        />
      </Modal>

      {/* Modal de duplicados */}
      {duplicatesData && (
        <DuplicatesModal
          isOpen={true}
          onClose={() => setDuplicatesData(null)}
          onConfirm={handleUpdateDuplicates}
          duplicates={duplicatesData}
          title="Tipos Duplicados Detectados"
          message="Los siguientes tipos ya existen en la base de datos. ¿Deseas actualizarlos con los datos del Excel?"
          columns={[
            { key: 'fila', label: 'Fila' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'idExistente', label: 'ID Existente' },
          ]}
        />
      )}
    </div>
  );
}
