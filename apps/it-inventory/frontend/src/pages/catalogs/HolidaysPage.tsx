import { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { holidaysService } from '@/services/holidaysService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import HolidayForm from '@/components/forms/catalogs/HolidayForm';
import toast from 'react-hot-toast';
import { ActionButton } from '@/components/shared/ActionButton';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const normalized = value.split('T')[0];
  return new Date(`${normalized}T00:00:00`).toLocaleDateString('es-ES');
};

export default function HolidaysPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canManageResource = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['holidays', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return holidaysService.getAll({ isActive });
    },
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['holidays'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleHolidayClick = (holidayId: number) => {
    setSelectedHolidayId(holidayId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedHolidayId(null);
    setModalHeaderButtons(null);
  };

  const handleExport = async () => {
    try {
      const blob = await holidaysService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'holidays.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Festivos exportados exitosamente');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await holidaysService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'holidays-template.xlsx';
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
      const result = await holidaysService.importFromExcel(file);

      if (result.data?.duplicados && result.data.duplicados.length > 0) {
        setDuplicatesData(result.data.duplicados);
        if (result.data.insertados > 0) {
          toast.success(`${result.data.insertados} festivos creados. Se detectaron ${result.data.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.data.duplicados.length} festivos duplicados. Revisa el modal para decidir si actualizar.`);
        }
      } else if (result.data?.errores && result.data.errores.length > 0) {
        result.data.errores.slice(0, 5).forEach((error: string) => {
          toast.error(error);
        });
        if (result.data.errores.length > 5) {
          toast.error(`...y ${result.data.errores.length - 5} errores mas`);
        }
      } else if (result.data?.insertados > 0) {
        toast.success(`${result.data.insertados} festivos creados exitosamente`);
      }

      queryClient.invalidateQueries({ queryKey: ['holidays'] });
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
      const result = await holidaysService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(result.message || `${result.data.actualizados} festivos actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar duplicados');
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '6%',
      sortable: true,
      render: (item) => item.id || '-',
    },
    {
      key: 'date',
      label: 'Fecha',
      width: '15%',
      sortable: true,
      render: (item) => formatDate(item.date),
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '24%',
      sortable: true,
      render: (item) => (
        <button
          onClick={() => handleHolidayClick(item.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del festivo"
        >
          {item.name || '-'}
        </button>
      ),
    },
    {
      key: 'description',
      label: 'Descripcion',
      width: '25%',
      render: (item) => item.description || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
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
      render: (item) => item.creator?.userName || '-',
    },
    {
      key: 'createdAt',
      label: 'Creacion',
      sortable: true,
      render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'isActive',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
      placeholder: 'Todos',
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Festivos</h1>
        <div className="flex items-center gap-3">
          <ActionButton variant="refresh" icon={RefreshCw} onClick={handleRefresh}>
            Refrescar
          </ActionButton>
          {canManageResource && (
            <>
              <ActionButton variant="export" icon={Download} onClick={handleExport}>
                Exportar
              </ActionButton>
              <ActionButton variant="template" icon={FileText} onClick={handleDownloadTemplate}>
                Plantilla
              </ActionButton>
              <ActionButton variant="import" icon={Upload} onClick={handleImport}>
                Importar
              </ActionButton>
              <ActionButton variant="create" icon={Plus} onClick={() => setIsCreateModalOpen(true)}>
                Nuevo
              </ActionButton>
            </>
          )}
        </div>
      </div>

      <DataTableFilters filters={filterConfigs} onFilterChange={handleFilterChange} />

      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : (
          <DataTable data={data?.data || []} columns={columns} keyExtractor={(item) => item.id.toString()} />
        )}
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Crear Festivo" size="lg">
        <HolidayForm mode="create" onSuccess={handleCreateSuccess} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!selectedHolidayId} onClose={handleDetailsClose} title="Detalles del Festivo" size="lg" headerActions={modalHeaderButtons}>
        {selectedHolidayId && (
          <HolidayForm
            mode="edit"
            holidayId={selectedHolidayId}
            onSuccess={handleDetailsClose}
            onCancel={handleDetailsClose}
            onHeaderButtons={setModalHeaderButtons}
          />
        )}
      </Modal>

      {duplicatesData && (
        <DuplicatesModal
          isOpen={true}
          onClose={() => setDuplicatesData(null)}
          onConfirm={handleUpdateDuplicates}
          duplicates={duplicatesData}
          title="Festivos duplicados detectados"
          message="Los siguientes festivos ya existen en la base de datos. ¿Deseas actualizarlos con los datos del Excel?"
          columns={[
            { key: 'fila', label: 'Fila' },
            { key: 'fecha', label: 'Fecha' },
            { key: 'nombre', label: 'Nombre' },
            { key: 'idExistente', label: 'ID Existente' },
          ]}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
