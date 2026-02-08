import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetRamFormFactorService } from '@/services/assetRamFormFactorService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import AssetRamFormFactorForm from '@/components/forms/catalogs/AssetRamFormFactorForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function AssetRamFormFactorsPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFormFactorId, setSelectedFormFactorId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-ram-form-factors', selectedSiteId, filters],
    queryFn: () => assetRamFormFactorService.getAll(),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-ram-form-factors'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleFormFactorClick = (formFactorId: number) => {
    setSelectedFormFactorId(formFactorId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedFormFactorId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await assetRamFormFactorService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'form-factors-ram.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Form factors exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await assetRamFormFactorService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'asset-ram-form-factors-template.xlsx';
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
      const result = await assetRamFormFactorService.importFromExcel(file);
      
      // Manejar duplicados
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} form factors creados. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} form factors duplicados. Revisa el modal para decidir si actualizar.`);
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
        toast.success(`${result.data.insertados} form factors creados exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['asset-ram-form-factors'] });
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
      const result = await assetRamFormFactorService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} form factors actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['asset-ram-form-factors'] });
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
      render: (formFactor) => formFactor.id || '-',
    },
    {
      key: 'code',
      label: 'Código',
      width: '15%',
      sortable: true,
      render: (formFactor) => formFactor.code || '-',
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '30%',
      sortable: true,
      render: (formFactor) => (
        <button
          onClick={() => handleFormFactorClick(formFactor.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del form factor"
        >
          {formFactor.name || '-'}
        </button>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (formFactor) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            formFactor.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {formFactor.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '12%',
      sortable: true,
      render: (formFactor) => (formFactor.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (formFactor) => (formFactor.createdAt ? new Date(formFactor.createdAt).toLocaleString('es-ES') : '-'),
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
          Form Factors RAM
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
                title="Crear nuevo form factor"
              >
                Nuevo form factor
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
            <p className="text-gray-600 dark:text-gray-400">Cargando form factors RAM...</p>
          </div>
        ) : (
          <DataTable
            data={data || []}
            columns={columns}
            keyExtractor={(formFactor) => formFactor.id}
            emptyMessage="No se encontraron form factors RAM"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear Form Factor */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Form Factor RAM"
        size="lg"
      >
        <AssetRamFormFactorForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Form Factor */}
      <Modal
        isOpen={!!selectedFormFactorId}
        onClose={handleDetailsClose}
        title="Detalles del Form Factor RAM"
        size="lg"
        headerActions={modalHeaderButtons}
      >
        <AssetRamFormFactorForm
          mode="edit"
          formFactorId={selectedFormFactorId!}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['asset-ram-form-factors'] })}
          onCancel={handleDetailsClose}
          onHeaderButtons={setModalHeaderButtons}
        />
      </Modal>

      {/* Modal Duplicados */}
      <DuplicatesModal
        isOpen={!!duplicatesData}
        onClose={() => setDuplicatesData(null)}
        duplicates={duplicatesData || []}
        onConfirm={handleUpdateDuplicates}
        columns={[
          { key: 'Código', label: 'Código' },
          { key: 'Nombre', label: 'Nombre' },
        ]}
        title="Duplicados de Form Factors RAM"
        message="Se encontraron form factors duplicados. ¿Deseas actualizarlos?"
      />
    </div>
  );
}
