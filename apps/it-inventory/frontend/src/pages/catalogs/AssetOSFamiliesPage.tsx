import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetOsFamiliesService } from '@/services/assetOsFamiliesService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import AssetOSFamiliesForm from '@/components/forms/catalogs/AssetOSFamiliesForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

export default function OSFamiliesPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['os-families', selectedSiteId, filters],
    queryFn: () => AssetOsFamiliesService.getAll(),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['os-families'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleFamilyClick = (familyId: number) => {
    setSelectedFamilyId(familyId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedFamilyId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await AssetOsFamiliesService.exportFamiliesToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'os-families.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Familias exportadas exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await AssetOsFamiliesService.downloadFamiliesTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'os-families-template.xlsx';
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
      const result = await AssetOsFamiliesService.importFamiliesFromExcel(file);
      
      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} familias creadas. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} familias duplicadas. Revisa el modal para decidir si actualizar.`);
        }
      } else if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
        if (result.data.errores.length > 5) {
          toast.error(`...y ${result.data.errores.length - 5} errores más`);
        }
      } else if (result.data?.insertados > 0) {
        toast.success(`${result.data.insertados} familias creadas exitosamente`);
      }
      
      queryClient.invalidateQueries({ queryKey: ['os-families'] });
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
      const result = await AssetOsFamiliesService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} familias actualizadas`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['os-families'] });
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
      render: (family) => family.id || '-',
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '30%',
      sortable: true,
      render: (family) => (
        <button
          onClick={() => handleFamilyClick(family.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles de la familia de SO"
        >
          {family.name || '-'}
        </button>
      ),
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (family) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          family.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        }`}>
          {family.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '15%',
      sortable: true,
      render: (family) => (family.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Fecha creación',
      width: '15%',
      sortable: true,
      render: (family) => (family.createdAt ? new Date(family.createdAt).toLocaleString('es-ES') : '-'),
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
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Familias de Sistemas Operativos
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
              <ActionButton
                variant="create"
                icon={Plus}
                onClick={() => setIsCreateModalOpen(true)}
                title="Crear nueva familia de SO"
              >
                Nueva Familia
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
            <p className="text-gray-600 dark:text-gray-400">Cargando familias de SO...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data || []}
            keyExtractor={(family) => family.id}
            emptyMessage="No hay familias de SO registradas"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear Familia */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Familia de SO"
        size="xxl"
      >
        <AssetOSFamiliesForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Familia */}
      <Modal
        isOpen={selectedFamilyId !== null}
        onClose={handleDetailsClose}
        title="Detalles de la Familia de SO"
        size="xxl"
        headerActions={modalHeaderButtons}
      >
        {selectedFamilyId && (
          <AssetOSFamiliesForm
            mode="edit"
            familyId={selectedFamilyId}
            onSuccess={handleDetailsClose}
            onCancel={handleDetailsClose}
            onHeaderButtons={setModalHeaderButtons}
          />
        )}
      </Modal>

      {/* Modal Duplicados */}
      {duplicatesData && (
        <DuplicatesModal
          isOpen={!!duplicatesData}
          onClose={() => setDuplicatesData(null)}
          onConfirm={handleUpdateDuplicates}
          duplicates={duplicatesData}
          columns={[
            { key: 'fila', label: 'Fila Excel' },
            { key: 'nombre', label: 'Nombre' },
          ]}
          title="Familias Duplicadas Detectadas"
          message="Las siguientes familias ya existen en la base de datos. ¿Deseas actualizarlas?"
        />
      )}
    </div>
  );
}
