import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsService, Assignment } from '@/services/assignmentsService';
import { useAuthStore } from '@/store/authStore';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import Modal from '@/components/shared/Modal';
import { ActionButton } from '@/components/shared/ActionButton';
import AssignmentForm from '@/components/forms/AssignmentForm';
import { Plus, Undo2, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parseExcelFile } from '@/utils/excelHelpers';
import { getSiteColor } from '@/utils/uiHelpers';

export default function AssignmentsPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [importing, setImporting] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
  }>({});

  // Queries
  const { data, isLoading } = useQuery({
    queryKey: ['assignments', selectedSiteId, filters],
    queryFn: () => assignmentsService.getAll(selectedSiteId || undefined),
  });

  const assignments = data?.data || [];

  // Filtrar asignaciones según el estado seleccionado
  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    if (filters.status === 'active') return !assignment.returnedAt;
    if (filters.status === 'returned') return assignment.returnedAt;
    return true; // 'all' o sin filtro
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['assignments'] });
    toast.success('Datos actualizados');
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await assignmentsService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignments-template-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Plantilla descargada exitosamente');
    } catch (error: any) {
      toast.error(error?.message || 'Error al descargar plantilla');
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const json = await parseExcelFile(file);
      const result = await assignmentsService.importFromExcel(json);
      
      if (result.errores && result.errores.length > 0) {
        toast.warn(`Importados: ${result.insertados}. Errores: ${result.errores.length}`);
      } else {
        toast.success('Importación exitosa');
      }
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    } catch (err: any) {
      toast.error('Error al importar: ' + (err?.message || 'Error desconocido'));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleExportToExcel = async () => {
    if (!filteredAssignments || filteredAssignments.length === 0) {
      toast.warn('No hay datos para exportar');
      return;
    }

    try {
      const blob = await assignmentsService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignments-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Exportados ${filteredAssignments.length} registros`);
    } catch (error: any) {
      toast.error(error?.message || 'Error al exportar');
    }
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters as typeof filters);
  };

  const openReturnModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsReturnModalOpen(true);
  };

  const handleCloseReturnModal = () => {
    setIsReturnModalOpen(false);
    setSelectedAssignment(null);
  };

  const columns: Column<Assignment>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (asset) => asset.id || '-',
    },
    {
      key: 'asset',
      label: 'Activo',
      sortable: true,
      sortValue: (item) => item.asset.assetTag,
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{item.asset.assetTag}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {item.asset.model?.brand?.name || ''} {item.asset.model?.name || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'employee',
      label: 'Empleado',
      sortable: true,
      sortValue: (item) => `${item.employee.firstName} ${item.employee.lastName}`,
      render: (item) => (
        <span className="text-gray-900 dark:text-white">
          {item.employee.firstName} {item.employee.lastName}
        </span>
      ),
    },
    {
      key: 'site',
      label: 'Sede',
      sortable: true,
      sortValue: (item) => item.site?.name || '',
      render: (item) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getSiteColor(item.site?.code || '')}`}>
          {item.site?.code || '-'}
        </span>
      ),
    },
    {
      key: 'assignedAt',
      label: 'Fecha Asignación',
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-300">
          {new Date(item.assignedAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
          })}
        </span>
      ),
    },
    {
      key: 'returnedAt',
      label: 'Estado',
      sortable: true,
      sortValue: (item) => item.returnedAt ? '1' : '0',
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.returnedAt
              ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}
        >
          {item.returnedAt ? 'Devuelto' : 'Activo'}
        </span>
      ),
    },
    {
      key: 'returned',
      label: 'Fecha Devolución',
      sortable: true,
      sortValue: (item) => item.returnedAt || '',
      render: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-300">
          {item.returnedAt
            ? new Date(item.returnedAt).toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Madrid'
              })
            : '-'}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Notas',
      sortable: true,
      sortValue: (item) => item.comment || '',
      render: (item) => (
        <span className="text-sm text-gray-900 dark:text-gray-300">
          {item.comment || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item) => (
        <div className="flex gap-2">
          {!item.returnedAt && (
            <button
              onClick={() => openReturnModal(item)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              title="Devolver activo"
            >
              <Undo2 size={18} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'active', label: 'Activos' },
        { value: 'returned', label: 'Devueltos' },
      ],
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Asignaciones
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
            onClick={handleExportToExcel}
            title="Exportar a Excel"
          >
            Exportar
          </ActionButton>
          <label className="btn btn-secondary flex items-center gap-2 cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" title="Importar desde Excel">
            <Upload className="h-5 w-5" />
            <span>{importing ? 'Importando...' : 'Importar'}</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              disabled={importing}
              onChange={handleImportExcel}
            />
          </label>
          <ActionButton 
            variant="create"
            icon={Plus}
            onClick={() => setIsCreateModalOpen(true)}
            title="Nueva asignación"
          >
            Nueva Asignación
          </ActionButton>
        </div>
      </div>

      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        aria-label="Notificaciones"
      />

      {/* Filtros */}
      <div className="mb-6">
        <DataTableFilters
          filters={filterConfigs}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Cargando asignaciones...
          </div>
        ) : (
          <DataTable<Assignment>
            data={filteredAssignments}
            columns={columns}
            keyExtractor={(item) => item.id.toString()}
            emptyMessage="No hay asignaciones registradas"
          />
        )}
      </div>

      {/* Modal: Nueva Asignación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Asignación"
        size="lg"
      >
        <AssignmentForm
          mode="create"
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal: Devolver Activo */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={handleCloseReturnModal}
        title="Devolver Activo"
        size="md"
      >
        {selectedAssignment && (
          <AssignmentForm
            mode="return"
            assignment={selectedAssignment}
            onSuccess={handleCloseReturnModal}
            onCancel={handleCloseReturnModal}
          />
        )}
      </Modal>
    </div>
  );
}
