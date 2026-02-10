import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { employeesService } from '@/services/employeesService';
import { sitesService } from '@/services/sitesService';
import { useAuthStore } from '@/store/authStore';
import { Plus, RefreshCw, FileText, Download, Upload } from 'lucide-react';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import { getSiteColor } from '@/utils/uiHelpers';
import Modal from '@/components/shared/Modal';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import EmployeeForm from '@/components/forms/EmployeeForm';
import { ActionButton } from '@/components/shared/ActionButton';
import toast from 'react-hot-toast';
import { parseExcelFile, exportEmployeesToExcel } from '@/utils/excelHelpers';

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{ isActive?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [modalHeaderButtons, setModalHeaderButtons] = useState<React.ReactNode>(null);
  const [importing, setImporting] = useState(false);
  const [duplicatesData, setDuplicatesData] = useState<any[] | null>(null);

  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('employees');

  const { data, isLoading } = useQuery({
    queryKey: ['employees', selectedSiteId, filters],
    queryFn: () => {
      const isActive = filters.isActive === 'true' ? true : filters.isActive === 'false' ? false : undefined;
      return employeesService.getAll({ isActive, siteId: selectedSiteId || undefined });
    },
  });

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: () => employeesService.getById(selectedEmployeeId!),
    enabled: !!selectedEmployeeId,
  });

  const { data: employeeSite } = useQuery({
    queryKey: ['site', selectedEmployee?.data?.siteId],
    queryFn: () => sitesService.getById(selectedEmployee!.data.siteId),
    enabled: !!selectedEmployee?.data?.siteId,
  });

  const handleDownloadTemplate = async () => {
    try {
      const blob = await employeesService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees-template-${new Date().toISOString().split('T')[0]}.xlsx`;
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
      
      // Enviar al backend
      const result = await employeesService.importFromExcel(json);
      
      // Manejar duplicados
      if (result.duplicados && result.duplicados.length > 0) {
        setDuplicatesData(result.duplicados);
        if (result.insertados > 0) {
          toast.success(`${result.insertados} empleados creados. Se detectaron ${result.duplicados.length} duplicados.`);
        } else {
          toast(`Se detectaron ${result.duplicados.length} empleados duplicados. Revisa el modal para decidir si actualizar.`);
        }
      } else if (result.errores && result.errores.length > 0) {
        toast.error(`Importados: ${result.insertados}. Errores: ${result.errores.length}`);
        // Mostrar hasta 5 errores específicos
        const maxErrors = Math.min(result.errores.length, 5);
        for (let i = 0; i < maxErrors; i++) {
          const error = result.errores[i];
          toast.error(`Fila ${error.row}: ${error.error}`);
        }
        if (result.errores.length > 5) {
          toast.error(`... y ${result.errores.length - 5} errores más`);
        }
      } else {
        toast.success(`Importación exitosa: ${result.insertados} empleados creados`);
      }
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (err: any) {
      toast.error('Error al importar: ' + (err?.message || 'Error desconocido'));
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleUpdateDuplicates = async () => {
    if (!duplicatesData) return;
    try {
      const result = await employeesService.updateDuplicatesFromExcel(duplicatesData);
      toast.success(`${result.actualizados} empleados actualizados`);
      setDuplicatesData(null);
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (err: any) {
      toast.error('Error al actualizar: ' + (err?.message || 'Error desconocido'));
    }
  };

  const handleExportToExcel = () => {
    if (!data?.data || data.data.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const count = exportEmployeesToExcel(data.data);
      toast.success(`Exportados ${count} empleados`);
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar');
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['employees'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleEmployeeClick = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
  };

  const handleDetailsClose = () => {
    setSelectedEmployeeId(null);
    setModalHeaderButtons(null);
  };

  const formatPhone = (phone?: string | null) => {
    if (!phone) return '-';

    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 9) return digits;

    return digits.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '5%',
      sortable: true,
      render: (employee) => employee.id || '-',
    },
    {
      key: 'name',
      label: 'Nombre',
      width: '20%',
      sortable: true,
      render: (employee) => (
        <button
          onClick={() => handleEmployeeClick(employee.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline text-left"
          title="Ver detalles del empleado"
        >
          {`${employee.firstName} ${employee.lastName} ${employee.secondLastName || ''}`.trim()}
        </button>
      ),
    },
    {
      key: 'site',
      label: 'Sede',
      width: '8%',
      sortable: true,
      render: (employee) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getSiteColor(employee.site?.code || '')}`}>
          {employee.site?.code || '-'}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      width: '20%',
      sortable: true,
      render: (employee) => employee.email || '-',
    },
    {
      key: 'phone',
      label: 'Teléfono',
      width: '12%',
      sortable: true,
      render: (employee) => formatPhone(employee.phone) || '-',
    },
    {
      key: 'isActive',
      label: 'Estado',
      sortable: true,
      render: (employee) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            employee.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
          }`}
        >
          {employee.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'notes',
      label: 'Observaciones',
      sortable: true,
      render: (employee) => employee.notes || '-',
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      sortable: true,
      render: (employee) => (employee.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (employee) => (employee.createdAt ? new Date(employee.createdAt).toLocaleString('es-ES') : '-'),
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
          Empleados
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
                onClick={handleExportToExcel}
                title="Exportar a Excel"
              >
                Exportar
              </ActionButton>
              <ActionButton
                variant="import"
                icon={Upload}
                onClick={() => document.getElementById('employee-file-input')?.click()}
                loading={importing}
                loadingText="Importando..."
                title="Importar desde Excel"
              >
                Importar
              </ActionButton>
              <input
                id="employee-file-input"
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                disabled={importing}
                onChange={handleImportExcel}
              />
              {selectedSiteId && (
                <ActionButton
                  variant="create"
                  icon={Plus}
                  onClick={() => setIsCreateModalOpen(true)}
                  title="Crear nuevo empleado"
                >
                  Nuevo Empleado
                </ActionButton>
              )}
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
            keyExtractor={(employee) => employee.id}
            emptyMessage="No se encontraron empleados"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal Crear Empleado */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Empleado"
        size="xl"
      >
        <EmployeeForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal Detalles Empleado */}
      <Modal
        isOpen={selectedEmployeeId !== null}
        onClose={handleDetailsClose}
        title="Detalles del Empleado"
        titleBadge={
          employeeSite?.data && (
            <span className={`px-3 py-1 text-sm font-medium rounded-lg ${getSiteColor(employeeSite.data.code)}`}>
              {employeeSite.data.code}
            </span>
          )
        }
        size="xl"
        headerActions={modalHeaderButtons}
      >
        {selectedEmployeeId && (
          <EmployeeForm
            mode="edit"
            employeeId={selectedEmployeeId}
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
        title="Empleados Duplicados Detectados"
        message="Se encontraron empleados con emails que ya existen en la base de datos. ¿Deseas actualizar los datos de estos empleados con la información del Excel?"
        columns={[
          { key: 'row', label: 'Fila' },
          { key: 'email', label: 'Email' },
          { 
            key: 'nombre', 
            label: 'Nombre',
            render: (dup) => `${dup.data?.firstName || ''} ${dup.data?.lastName || ''}`.trim()
          },
          { key: 'existingId', label: 'ID Existente' },
        ]}
      />
    </div>
  );
}
