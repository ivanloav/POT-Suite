import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetOsVersionsService } from '@/services/assetOsVersionsService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import { getOSFamilyColor } from '@/utils/uiHelpers';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import AssetOSVersionForm from '@/components/forms/catalogs/AssetOSVersionsForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function OSPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOSVersionId, setSelectedOSVersionId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-os', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return AssetOsVersionsService.getAll({ isActive, siteId: selectedSiteId || undefined });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-os'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleOSVersionClick = (osVersionId: number) => {
    setSelectedOSVersionId(osVersionId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedOSVersionId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await AssetOsVersionsService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'os-versions.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Versiones de SO exportadas exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AssetOsVersionsService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'os-versions-template.xlsx';
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
      const result = await AssetOsVersionsService.importFromExcel(file);
      
      // Manejar duplicados
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} versiones creadas. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} versiones duplicadas. Revisa el modal para decidir si actualizar.`);
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
        toast.success(`${result.data.insertados} versiones creadas exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-os'] });
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
      const result = await AssetOsVersionsService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} versiones actualizadas`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-os'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar duplicados');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (osVersion) => osVersion.id || '-',
    },
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (osVersion) => (
        <button
          onClick={() => handleOSVersionClick(osVersion.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del sistema operativo"
        >
          {`${osVersion.name}`.trim()}
        </button>
      ),
    },
    {
      key: 'OSFamily',
      label: 'Familia de S.O.',
      sortable: true,
      render: (osVersion) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getOSFamilyColor(osVersion.osFamily?.name || '')}`}>
          {osVersion.osFamily.name || '-'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (osVersion) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            osVersion.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {osVersion.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      sortable: true,
      render: (osVersion) => (osVersion.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (osVersion) => (osVersion.createdAt ? new Date(osVersion.createdAt).toLocaleString('es-ES') : '-'),
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
            Versiones de sistemas operativos
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
                title="Crear nueva versión de SO"
                >
                    Nuevo S.O.
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
            <p className="text-gray-600 dark:text-gray-400">Cargando empleados...</p>
          </div>
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
            keyExtractor={(osVersion) => osVersion.id}
            emptyMessage="No se encontraron sistemas operativos"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear OS */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva versión de S.O."
        size="xxl"
      >
        <AssetOSVersionForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles OS */}
      <Modal
        isOpen={selectedOSVersionId !== null}
        onClose={handleDetailsClose}
        title="Detalles del S.O."
        size="xxl"
        headerActions={modalHeaderButtons}
      >
        {selectedOSVersionId && (
          <AssetOSVersionForm
            mode="edit"
            osVersionId={selectedOSVersionId}
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
        columns={[
          { key: 'fila', label: 'Fila' },
          { key: 'familia', label: 'Familia SO' },
          { key: 'nombre', label: 'Nombre' },
          { key: 'idExistente', label: 'ID Existente' },
        ]}
        title="Versiones de SO Duplicadas"
        message="Se detectaron versiones de SO que ya existen en el sistema. ¿Deseas actualizarlas con los datos del archivo?"
      />
    </div>
  );
}
