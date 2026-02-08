
import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetRamService } from '@/services/assetRamService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';

import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';
import AssetRAMForm from '@/components/forms/catalogs/AssetRAMForm';

export default function AssetRAMPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRAMId, setSelectedRAMId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-ram', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return AssetRamService.getAll({ isActive, siteId: selectedSiteId || undefined });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-ram'] });
    queryClient.invalidateQueries({ queryKey: ['ram-mem-types'] });
    queryClient.invalidateQueries({ queryKey: ['ram-form-factors'] });
    toast.success('Datos actualizados');
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleRAMClick = (ramId: number) => {
    setSelectedRAMId(ramId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedRAMId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await AssetRamService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ram.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Listado de RAM exportado exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AssetRamService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ram-template.xlsx';
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
      const result = await AssetRamService.importFromExcel(file);
      
      // Manejar duplicados
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} RAM creados. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} RAM duplicados. Revisa el modal para decidir si actualizar.`);
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
        toast.success(`${result.data.insertados} RAM creados exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-ram'] });
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
      const result = await AssetRamService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} RAM actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-ram'] });
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
      render: (ram) => ram.id || '-',
    },
    {
      key: 'capacityGb',
      label: 'Capacidad',
      width: '8%',
      sortable: true,
      render: (ram) => `${ram.capacityGb} GB` || '-',
    },
    {
      key: 'memType',
      label: 'Tipo',
      width: '8%',
      sortable: true,
      sortValue: (ram) => ram.memType?.name || '',
      render: (ram) => (
        <button
          onClick={() => handleRAMClick(ram.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del RAM"
        >
          {ram.memType?.name || '-'}
        </button>
      ),
    },
    {
      key: 'speedMts',
      label: 'Velocidad (MT/s)',
      width: '10%',
      sortable: true,
      render: (ram) => ram.speedMts || '-',
    },
    {
      key: 'formFactor',
      label: 'Factor de forma',
      width: '10%',
      sortable: true,
      sortValue: (ram) => ram.formFactor?.name || '',
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (ram) => ram.formFactor?.name || '-',
    },
    {
      key: 'notes',
      label: 'Observaciones',
      sortable: true,
      className: 'text-left text-gray-800 dark:text-gray-100',
      render: (ram) => ram.notes || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '8%',
      sortable: true,
      render: (ram) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            ram.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {ram.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '10%',
      sortable: true,
      render: (ram) => (ram.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      width: '12%',
      sortable: true,
      render: (ram) => (ram.createdAt ? new Date(ram.createdAt).toLocaleString('es-ES') : '-'),
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
            Catálogo de RAM
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
                title="Crear nueva RAM"
                >
                    Nueva RAM
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
            <p className="text-gray-600 dark:text-gray-400">Cargando catálogo de RAM...</p>
          </div>
        ) : (
          <DataTable
            data={data?.data || []}
            columns={columns}
            keyExtractor={(ram) => ram.id}
            emptyMessage="No se encontraron RAM"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear RAM */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva RAM"
        size="xxl"
      >
        <AssetRAMForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles RAM */}
      <Modal
        isOpen={selectedRAMId !== null}
        onClose={handleDetailsClose}
        title="Detalles del RAM"
        size="xxl"
        headerActions={modalHeaderButtons}
      >
        {selectedRAMId && (
          <AssetRAMForm
            mode="edit"
            assetRAMId={selectedRAMId}
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
        title="RAM Duplicados Detectados"
        message="Las siguientes RAM ya existen en la base de datos. ¿Deseas actualizarlos con los datos del Excel?"
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
