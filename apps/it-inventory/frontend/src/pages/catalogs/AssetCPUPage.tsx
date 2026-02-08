import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetCpuService } from '@/services/assetCpuService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';

import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';
import AssetCPUForm from '@/components/forms/catalogs/AssetCPUForm';

export default function AssetCpuPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-cpu', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return AssetCpuService.getAll({ isActive, siteId: selectedSiteId || undefined });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-cpu'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleModelClick = (modelId: number) => {
    setSelectedModelId(modelId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedModelId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await AssetCpuService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cpu.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Listado de CPU exportado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AssetCpuService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cpu-template.xlsx';
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
      const result = await AssetCpuService.importFromExcel(file);
      
      // Manejar duplicados
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} CPU creados. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} CPU duplicados. Revisa el modal para decidir si actualizar.`);
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
        toast.success(`${result.data.insertados} CPU creados exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-cpu'] });
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
      const result = await AssetCpuService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} CPU actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-cpu'] });
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
      render: (cpu) => cpu.id || '-',
    },
    {
      key: 'vendor',
      label: 'Fabricante',
      width: '10%',
      sortable: true,
      render: (cpu) => cpu.vendor?.name || '-',
    },
    {
      key: 'model',
      label: 'Modelo',
      width: '20%',
      sortable: true,
      render: (cpu) => (
        <button
          onClick={() => handleModelClick(cpu.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del CPU"
        >
          {cpu.model || '-'}
        </button>
      ),
    },
    {
      key: 'segment',
      label: 'Segmento',
      sortable: true,
      render: (cpu) => cpu.segment?.name || '-',
    },
    {
      key: 'cores',
      label: 'Núcleos',
      sortable: true,
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (cpu) => cpu.cores || '-',
    },
    {
      key: 'threads',
      label: 'Hilos',
      sortable: true,
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (cpu) => cpu.threads || '-',
    },
    {
      key: 'baseGhz',
      label: 'GHz Base',
      sortable: true,
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (cpu) => cpu.baseGhz ? `${cpu.baseGhz} GHz` : '-',
    },
    {
      key: 'boostGhz',
      label: 'GHz Boost',
      sortable: true,
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (cpu) => cpu.boostGhz ? `${cpu.boostGhz} GHz` : '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (cpu) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            cpu.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {cpu.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      sortable: true,
      render: (cpu) => (cpu.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (cpu) => (cpu.createdAt ? new Date(cpu.createdAt).toLocaleString('es-ES') : '-'),
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
            Catálogo de CPUs
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
                title="Crear nueva CPU"
                >
                    Nueva CPU
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
            <p className="text-gray-600 dark:text-gray-400">Cargando catálogo de CPUs...</p>
          </div>
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
            keyExtractor={(cpu) => cpu.id}
            emptyMessage="No se encontraron CPUs"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear CPU */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva CPU"
        size="xxl"
      >
        <AssetCPUForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles CPU */}
      <Modal
        isOpen={selectedModelId !== null}
        onClose={handleDetailsClose}
        title="Detalles del CPU"
          size="xxl"
          headerActions={modalHeaderButtons}
      >
        {selectedModelId && (
          <AssetCPUForm
            mode="edit"
            assetCPUId={selectedModelId}
            onHeaderButtons={setModalHeaderButtons}
            onSuccess={handleDetailsClose}
            onCancel={handleDetailsClose}
          />
        )}
      </Modal>

      {/* Modal Duplicados */}
      <DuplicatesModal
        isOpen={!!duplicatesData && duplicatesData.length > 0}
        onClose={() => setDuplicatesData(null)}
        onConfirm={handleUpdateDuplicates}
        duplicates={duplicatesData || []}
        title="CPU Duplicados Detectados"
        message="Las siguientes CPU ya existen en la base de datos. ¿Deseas actualizarlos con los datos del Excel?"
        columns={[
          { key: 'fila', label: 'Fila' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'marca', label: 'Marca' },
          { key: 'modelo', label: 'Modelo' },
          { key: 'idExistente', label: 'ID Existente' },
        ]}
      />
    </div>
  );
}
