import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { assetMaintenancePlansService } from '@/services/assetMaintenancePlansService';
import { assetMaintenanceRecordsService } from '@/services/assetMaintenanceRecordsService';
import { sitesService } from '@/services/sitesService';
import { assetMaintenanceTypeService } from '@/services/assetMaintenanceTypeService';
import { holidaysService, Holiday } from '@/services/holidaysService';
import { Plus, RefreshCw, Wrench, AlertTriangle, Clock, CheckCircle, TrendingUp, Download, Search, RotateCcw, Gauge, FileDown, Upload, Copy } from 'lucide-react';
import { ActionButton } from '@/components/shared/ActionButton';
import { StatsCard } from '@/components/shared/StatsCard';
import Modal from '@/components/shared/Modal';
import { DataTable, Column, DataTableFilters, FilterConfig } from '@/components/shared/DataTable';
import AssetMaintenancePlanForm from '@/components/forms/maintenance/AssetMaintenancePlanForm';
import toast from 'react-hot-toast';

interface MaintenancePlanRow {
  id: number;
  siteId: number;
  assetId: number;
  title: string;
  maintenanceType?: string;
  priority?: string;
  description?: string;
  isRecurring?: boolean;
  frequencyDays?: number | null;
  nextDueDate: string;
  lastDoneAt?: string;
  isActive: boolean;
  createdAt: string;
  asset?: { id: number; assetTag: string };
  creator?: { userName: string };
}

interface MaintenanceRecordRow {
  id: number;
  siteId: number;
  assetId: number;
  planId: number;
  performedAt: string;
  scheduledDate?: string;
  status: string;
  notes?: string;
  incidents?: string;
  createdAt: string;
  asset?: { id: number; assetTag: string };
  plan?: { id: number; title: string };
  creator?: { userName: string };
}

interface ListRowItem {
  id: string;
  type: 'plan' | 'record';
  planId: number;
  assetTag: string;
  title: string;
  maintenanceType: string | undefined;
  priority: string | undefined;
  priorityLabel: string;
  priorityClass: string;
  date: string;
  status: string;
  statusClass: string;
  daysInfo: string | null;
  isActive: boolean;
  notes: string;
  incidents: string;
  createdBy: string;
  createdAt: string;
  recordInfo?: {
    performedAt: string;
    scheduledDate?: string;
    notes?: string;
    incidents?: string;
    createdBy?: string;
  };
}

const getMaintenanceIcon = (type?: string) => {
  if (!type) return Wrench;
  const lower = type.toLowerCase();
  if (lower.includes('preventivo')) return Gauge;
  if (lower.includes('correctivo')) return AlertTriangle;
  if (lower.includes('inspección') || lower.includes('inspeccion')) return Search;
  if (lower.includes('calibración') || lower.includes('calibracion')) return RotateCcw;
  return Wrench;
};

const toDateOnlyString = (value?: string | Date) => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateOnly = (value?: string | Date) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const dateValue = value.split('T')[0];
  return new Date(`${dateValue}T00:00:00`);
};

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const getPlanStatus = (plan: MaintenancePlanRow, dueDateOverride?: string) => {
  if (!plan.isActive) {
    return { 
      label: 'Inactivo', 
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
      daysInfo: null 
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateValue = dueDateOverride || plan.nextDueDate;
  const dueDate = parseDateOnly(dueDateValue);
  if (!dueDate) {
    return { 
      label: 'Programado', 
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      daysInfo: null 
    };
  }
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { 
      label: 'Vencido', 
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      daysInfo: `+${Math.abs(diffDays)} día${Math.abs(diffDays) !== 1 ? 's' : ''} vencido` 
    };
  }

  if (diffDays <= 7) {
    return { 
      label: 'Próximo', 
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      daysInfo: `en ${diffDays} día${diffDays !== 1 ? 's' : ''}` 
    };
  }

  return { 
    label: 'Programado', 
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    daysInfo: `en ${diffDays} día${diffDays !== 1 ? 's' : ''}` 
  };
};

const getPriorityBadge = (priority?: string) => {
  if (!priority) return { label: '-', className: '' };
  
  const lower = priority.toLowerCase();
  if (lower === 'critica' || lower === 'crítica') {
    return { label: 'Crítica', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' };
  }
  if (lower === 'alta') {
    return { label: 'Alta', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' };
  }
  if (lower === 'media') {
    return { label: 'Media', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' };
  }
  if (lower === 'baja') {
    return { label: 'Baja', className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
  }
  return { label: priority, className: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
};

export default function AssetMaintenancePage() {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);

  const [filters, setFilters] = useState<{ status?: string; assetTag?: string; maintenanceType?: string; priority?: string; dateFrom?: string; dateTo?: string }>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createPrefillDate, setCreatePrefillDate] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [detailsReadOnly, setDetailsReadOnly] = useState(false);
  const [detailsRecordInfo, setDetailsRecordInfo] = useState<{
    performedAt?: string;
    scheduledDate?: string;
    notes?: string;
    incidents?: string;
    createdBy?: string;
  } | null>(null);
  const [detailsHeaderActions, setDetailsHeaderActions] = useState<React.ReactNode>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'calendar'>(() => {
    if (typeof window === 'undefined') return 'list';
    const saved = window.sessionStorage.getItem('assetMaintenance.viewMode');
    if (saved === 'list' || saved === 'timeline' || saved === 'calendar') return saved;
    return 'list';
  });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.setItem('assetMaintenance.viewMode', viewMode);
  }, [viewMode]);

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['asset-maintenance-plans', selectedSiteId],
    queryFn: () => assetMaintenancePlansService.getAll({ siteId: selectedSiteId || undefined }),
  });

  const { data: recordsData, isLoading: isRecordsLoading } = useQuery({
    queryKey: ['asset-maintenance-records', selectedSiteId],
    queryFn: () => assetMaintenanceRecordsService.getAll({ siteId: selectedSiteId || undefined }),
  });

  const { data: selectedSite } = useQuery({
    queryKey: ['site', selectedSiteId],
    queryFn: () => sitesService.getById(selectedSiteId!),
    enabled: !!selectedSiteId,
  });

  const { data: maintenanceTypesData } = useQuery({
    queryKey: ['asset-maintenance-types'],
    queryFn: () => assetMaintenanceTypeService.getAll({ isActive: true }),
  });

  const { data: holidaysData } = useQuery({
    queryKey: ['holidays'],
    queryFn: () => holidaysService.getAll({ isActive: true }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, notes, incidents }: { id: number; notes?: string; incidents?: string }) =>
      assetMaintenancePlansService.complete(id, { notes, incidents }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-records'] });
      toast.success('Mantenimiento registrado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar mantenimiento');
    },
  });

  const plans: MaintenancePlanRow[] = plansData?.data || [];
  const records: MaintenanceRecordRow[] = recordsData?.data || [];
  const holidays: Holiday[] = holidaysData?.data || [];

  // Dashboard metrics
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const overdue = plans.filter((p) => {
      if (!p.isActive) return false;
      const dueDate = parseDateOnly(p.nextDueDate);
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }).length;

    const upcoming = plans.filter((p) => {
      if (!p.isActive) return false;
      const dueDate = parseDateOnly(p.nextDueDate);
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate <= sevenDaysFromNow;
    }).length;

    const completedThisMonth = records.filter((r) => {
      const performedDate = new Date(r.performedAt);
      return performedDate >= firstDayOfMonth;
    }).length;

    const totalActivePlans = plans.filter((p) => p.isActive).length;
    const onTimePlans = plans.filter((p) => {
      if (!p.isActive) return false;
      const dueDate = parseDateOnly(p.nextDueDate);
      if (!dueDate) return false;
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today;
    }).length;
    const complianceRate = totalActivePlans > 0 ? Math.round((onTimePlans / totalActivePlans) * 100) : 100;

    return { overdue, upcoming, completedThisMonth, complianceRate };
  }, [plans, records]);

  const scheduledPlanRows = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const horizonDate = addDays(today, 60);

    return plans.flatMap((plan) => {
      const startDate = parseDateOnly(plan.nextDueDate);
      if (!startDate) return [];

      const frequencyDays = plan.frequencyDays ?? null;
      const isRecurring = plan.isRecurring !== false && !!frequencyDays;
      const rows: ListRowItem[] = [];
      let current = new Date(startDate);

      if (isRecurring && frequencyDays) {
        if (current < today) {
          const diffDays = Math.floor((today.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
          const jumps = Math.floor(diffDays / frequencyDays);
          if (jumps > 0) {
            current = addDays(current, jumps * frequencyDays);
          }
          while (current < today && addDays(current, frequencyDays) <= today) {
            current = addDays(current, frequencyDays);
          }
        }
      }

      let iterations = 0;
      while (current <= horizonDate && iterations < 120) {
        const dateKey = toDateOnlyString(current);
        const statusInfo = getPlanStatus(plan, dateKey);
        const priorityBadge = getPriorityBadge(plan.priority);
        rows.push({
          id: `plan-${plan.id}-${dateKey}`,
          type: 'plan' as const,
          planId: plan.id,
          assetTag: plan.asset?.assetTag || '-',
          title: plan.title,
          maintenanceType: plan.maintenanceType,
          priority: plan.priority,
          priorityLabel: priorityBadge.label,
          priorityClass: priorityBadge.className,
          date: dateKey,
          status: statusInfo.label,
          statusClass: statusInfo.className,
          daysInfo: statusInfo.daysInfo,
          isActive: plan.isActive,
          notes: '-',
          incidents: '-',
          createdBy: plan.creator?.userName || '-',
          createdAt: plan.createdAt,
        });

        if (!isRecurring) break;
        current = addDays(current, frequencyDays);
        iterations += 1;
      }

      return rows;
    });
  }, [plans]);

  const listRows = useMemo(() => {
    const recordRows: ListRowItem[] = records.map((record) => ({
      id: `record-${record.id}`,
      type: 'record' as const,
      planId: record.planId,
      assetTag: record.asset?.assetTag || '-',
      title: record.plan?.title || 'Mantenimiento',
      maintenanceType: undefined,
      priority: undefined,
      priorityLabel: '-',
      priorityClass: '',
      date: record.performedAt,
      status: 'Realizado',
      statusClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      daysInfo: null,
      isActive: true,
      notes: record.notes || '-',
      incidents: record.incidents || '-',
      createdBy: record.creator?.userName || '-',
      createdAt: record.createdAt,
      recordInfo: {
        performedAt: record.performedAt,
        scheduledDate: record.scheduledDate,
        notes: record.notes,
        incidents: record.incidents,
        createdBy: record.creator?.userName,
      },
    }));

    let result = [...scheduledPlanRows, ...recordRows];

    if (filters.assetTag) {
      result = result.filter((row) => row.assetTag === filters.assetTag);
    }

    if (filters.maintenanceType) {
      result = result.filter((row) => row.maintenanceType === filters.maintenanceType);
    }

    if (filters.priority) {
      result = result.filter((row) => row.priority?.toLowerCase() === filters.priority!.toLowerCase());
    }

    if (filters.dateFrom) {
      const fromDate = parseDateOnly(filters.dateFrom);
      if (fromDate) {
        result = result.filter((row) => {
          const rowDate = parseDateOnly(row.date);
          return rowDate ? rowDate >= fromDate : false;
        });
      }
    }

    if (filters.dateTo) {
      const toDate = parseDateOnly(filters.dateTo);
      if (toDate) {
        result = result.filter((row) => {
          const rowDate = parseDateOnly(row.date);
          return rowDate ? rowDate <= toDate : false;
        });
      }
    }

    if (filters.status) {
      result = result.filter((row) => {
        if (filters.status === 'realized') return row.type === 'record';
        if (row.type === 'record') return false;
        if (filters.status === 'active') return row.isActive;
        if (filters.status === 'inactive') return !row.isActive;
        if (filters.status === 'overdue') return row.status === 'Vencido';
        if (filters.status === 'upcoming') return row.status === 'Próximo';
        if (filters.status === 'scheduled') return row.status === 'Programado';
        return true;
      });
    }

    return result;
  }, [records, scheduledPlanRows, filters]);

  const uniqueAssetTags = useMemo(() => {
    const tags = new Set<string>();
    plans.forEach(plan => {
      if (plan.asset?.assetTag) tags.add(plan.asset.assetTag);
    });
    records.forEach(record => {
      if (record.asset?.assetTag) tags.add(record.asset.assetTag);
    });
    return Array.from(tags).sort();
  }, [plans, records]);

  const filterConfigs: FilterConfig[] = [
    {
      key: 'assetTag',
      label: 'Activo',
      type: 'select',
      options: uniqueAssetTags.map(tag => ({ value: tag, label: tag })),
      placeholder: 'Todos',
    },
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'scheduled', label: 'Programado' },
        { value: 'upcoming', label: 'Próximo (7 días)' },
        { value: 'overdue', label: 'Vencido' },
        { value: 'realized', label: 'Realizado' },
        { value: 'active', label: 'Activo' },
        { value: 'inactive', label: 'Inactivo' },
      ],
      placeholder: 'Todos',
    },
    {
      key: 'priority',
      label: 'Prioridad',
      type: 'select',
      options: [
        { value: 'critica', label: 'Crítica' },
        { value: 'alta', label: 'Alta' },
        { value: 'media', label: 'Media' },
        { value: 'baja', label: 'Baja' },
      ],
      placeholder: 'Todas',
    },
    {
      key: 'maintenanceType',
      label: 'Tipo de mantenimiento',
      type: 'select',
      options: (maintenanceTypesData?.data || []).map((type: any) => ({
        value: type.name,
        label: type.name,
      })),
      placeholder: 'Todos',
    },
    {
      key: 'dateFrom',
      label: 'Desde',
      type: 'date',
    },
    {
      key: 'dateTo',
      label: 'Hasta',
      type: 'date',
    },
  ];

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
    queryClient.invalidateQueries({ queryKey: ['asset-maintenance-records'] });
  };

  const handlePlanClick = (
    id: number,
    readOnly = false,
    recordInfo?: {
      performedAt?: string;
      scheduledDate?: string;
      notes?: string;
      incidents?: string;
      createdBy?: string;
    } | null
  ) => {
    setSelectedPlanId(id);
    setDetailsReadOnly(readOnly);
    setDetailsRecordInfo(recordInfo || null);
    setDetailsHeaderActions(null);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setCreatePrefillDate(null);
  };

  const handleDetailsModalClose = () => {
    setSelectedPlanId(null);
    setDetailsReadOnly(false);
    setDetailsRecordInfo(null);
    setDetailsHeaderActions(null);
  };

  const handleOpenCreateModal = (nextDueDate?: string) => {
    setCreatePrefillDate(nextDueDate || null);
    setIsCreateModalOpen(true);
  };

  const handleComplete = (data: { notes?: string; incidents?: string }) => {
    if (!selectedPlanId) return;
    completeMutation.mutate({ id: selectedPlanId, notes: data.notes, incidents: data.incidents });
  };

  const handleExportToExcel = async () => {
    try {
      toast.loading('Generando reporte...', { id: 'export' });
      const blob = await assetMaintenancePlansService.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mantenimientos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Reporte exportado exitosamente', { id: 'export' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al exportar', { id: 'export' });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      toast.loading('Descargando plantilla...', { id: 'template' });
      const blob = await assetMaintenancePlansService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla-mantenimientos-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Plantilla descargada', { id: 'template' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al descargar plantilla', { id: 'template' });
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Importando...', { id: 'import' });
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = await import('xlsx').then((XLSX) =>
            XLSX.read(data, { type: 'array' })
          );
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = await import('xlsx').then((XLSX) =>
            XLSX.utils.sheet_to_json(worksheet)
          );

          const result = await assetMaintenancePlansService.importFromExcel(jsonData);

          if (result.data.duplicados.length > 0) {
            const confirmUpdate = window.confirm(
              `Se encontraron ${result.data.duplicados.length} duplicados. ¿Actualizar?`
            );
            if (confirmUpdate) {
              await assetMaintenancePlansService.updateDuplicatesFromExcel(result.data.duplicados);
              toast.success('Duplicados actualizados', { id: 'import' });
            }
          }

          if (result.data.errores.length > 0) {
            console.error('Errores de importación:', result.data.errores);
            toast.error(`${result.data.insertados} insertados, ${result.data.errores.length} errores`, { id: 'import' });
          } else {
            toast.success(`${result.data.insertados} planes importados`, { id: 'import' });
          }

          queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Error al importar', { id: 'import' });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al leer archivo', { id: 'import' });
    }
    event.target.value = '';
  };

  const handleDuplicatePlan = async (planId: number) => {
    try {
      toast.loading('Duplicando plan...', { id: 'duplicate' });
      await assetMaintenancePlansService.duplicate(planId);
      toast.success('Plan duplicado exitosamente', { id: 'duplicate' });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
      handleDetailsModalClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al duplicar plan', { id: 'duplicate' });
    }
  };

  const columns: Column<(typeof listRows)[number]>[] = [
    {
      key: 'id',
      label: 'ID',
      width: '6%',
      sortable: true,
    },
    {
      key: 'asset',
      label: 'Activo',
      width: '18%',
      sortable: true,
      render: (item) => item.assetTag,
      sortValue: (item) => item.assetTag,
    },
    {
      key: 'title',
      label: 'Mantenimiento',
      width: '22%',
      sortable: true,
      render: (item) => {
        const Icon = getMaintenanceIcon(item.maintenanceType);
        return (
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <button
              onClick={() =>
                handlePlanClick(
                  item.planId,
                  item.type === 'record',
                  item.type === 'record' ? item.recordInfo : null
                )
              }
              className="text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {item.title}
            </button>
          </div>
        );
      },
    },
    {
      key: 'date',
      label: 'Fecha',
      width: '14%',
      sortable: true,
      render: (item) => {
        const dateValue = parseDateOnly(item.date);
        return dateValue ? dateValue.toLocaleDateString('es-ES') : '-';
      },
    },
    {
      key: 'status',
      label: 'Estado',
      width: '12%',
      render: (item) => (
        <div className="flex flex-col gap-1 items-center">
          <span className={`w-full text-center px-2 py-1 text-xs rounded-full ${item.statusClass}`}>
            {item.status}
          </span>
          {item.daysInfo && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {item.daysInfo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Prioridad',
      width: '10%',
      render: (item) => {
        if (item.type === 'record' || !item.priorityClass) {
          return (
            <div className="text-center text-gray-600 dark:text-gray-400">
              {item.priorityLabel || '-'}
            </div>
          );
        }
        return (
          <div className="flex justify-center px-2">
            <span className={`w-full text-center py-1 text-xs font-medium rounded-full ${item.priorityClass}`}>
              {item.priorityLabel}
            </span>
          </div>
        );
      },
    },
    {
      key: 'notes',
      label: 'Notas',
      width: '12%',
      render: (item) => item.notes,
    },
    {
      key: 'incidents',
      label: 'Incidencias',
      width: '12%',
      render: (item) => item.incidents,
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      width: '10%',
      sortable: true,
      render: (item) => item.createdBy,
      sortValue: (item) => item.createdBy,
    },
    {
      key: 'createdAt',
      label: 'Creación',
      width: '12%',
      sortable: true,
      render: (item) => (item.createdAt ? new Date(item.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

  const timelineItems = useMemo(() => {
    const upcoming = scheduledPlanRows.map((item) => ({
      id: item.id,
      type: 'plan' as const,
      date: item.date,
      title: item.title,
      maintenanceType: item.maintenanceType,
      assetTag: item.assetTag,
      status: item.status,
      statusClass: item.statusClass,
      daysInfo: item.daysInfo,
      isActive: item.isActive,
      planId: item.planId,
    }));

    const completed = records.map((record) => ({
      id: `record-${record.id}`,
      type: 'record' as const,
      date: record.performedAt,
      scheduledDate: record.scheduledDate,
      title: record.plan?.title || 'Mantenimiento',
      maintenanceType: undefined,
      assetTag: record.asset?.assetTag || '-',
      notes: record.notes,
      incidents: record.incidents,
      planId: record.planId,
      createdBy: record.creator?.userName,
    }));

    return [...upcoming, ...completed].sort((a, b) => {
      const dateA = parseDateOnly(a.date) || new Date(a.date);
      const dateB = parseDateOnly(b.date) || new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [records, scheduledPlanRows]);

  const timelineGroups = useMemo(() => {
    const groups: Record<string, typeof timelineItems> = {};
    timelineItems.forEach((item) => {
      const key = toDateOnlyString(item.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return Object.entries(groups)
      .map(([key, items]) => [
        key,
        items.sort((a, b) => {
          const dateA = parseDateOnly(a.date) || new Date(a.date);
          const dateB = parseDateOnly(b.date) || new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        }),
      ] as [string, typeof items])
      .sort(([a], [b]) => {
        const dateA = parseDateOnly(a) || new Date(a);
        const dateB = parseDateOnly(b) || new Date(b);
        return dateB.getTime() - dateA.getTime();
      });
  }, [timelineItems]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();
    const slots = Math.ceil((startOffset + totalDays) / 7) * 7;

    return Array.from({ length: slots }, (_, index) => {
      const dayNumber = index - startOffset + 1;
      const date = new Date(year, month, dayNumber);
      return {
        date,
        isCurrentMonth: dayNumber >= 1 && dayNumber <= totalDays,
      };
    });
  }, [currentMonth]);

  const calendarItems = useMemo(() => {
    const toDateKey = (value?: string) => {
      if (!value) return '';
      return toDateOnlyString(value);
    };

    const items = scheduledPlanRows.map((item) => ({
      id: item.id,
      type: 'plan' as const,
      dateKey: toDateKey(item.date),
      title: item.title,
      assetTag: item.assetTag,
      status: item.status,
      planId: item.planId,
    }));

    const completed = records.map((record) => ({
      id: `record-${record.id}`,
      type: 'record' as const,
      dateKey: toDateKey(record.performedAt),
      title: record.plan?.title || 'Mantenimiento',
      assetTag: record.asset?.assetTag || '-',
      planId: record.planId,
      performedAt: record.performedAt,
      scheduledDate: record.scheduledDate,
      notes: record.notes,
      incidents: record.incidents,
      createdBy: record.creator?.userName,
    }));

    return [...items, ...completed];
  }, [records, scheduledPlanRows]);

  const calendarItemsByDate = useMemo(() => {
    return calendarItems.reduce<Record<string, typeof calendarItems>>((acc, item) => {
      if (!item.dateKey) return acc;
      if (!acc[item.dateKey]) acc[item.dateKey] = [];
      acc[item.dateKey].push(item);
      return acc;
    }, {});
  }, [calendarItems]);

  const holidaysByDate = useMemo(() => {
    return holidays.reduce<Record<string, Holiday>>((acc, holiday) => {
      if (holiday.date) {
        acc[holiday.date] = holiday;
      }
      return acc;
    }, {});
  }, [holidays]);

  const monthLabel = `${currentMonth.toLocaleString('es-ES', { month: 'long' })} ${currentMonth.toLocaleString('es-ES', { year: 'numeric' })}`.toLowerCase();

  const handleMonthChange = (direction: -1 | 1) => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mantenimientos</h1>
          <div className="flex flex-wrap gap-2">
            <ActionButton
              type="button"
              variant="refresh"
              onClick={() => setViewMode('list')}
              className={`text-sm ${viewMode === 'list' ? 'ring-2 ring-blue-400' : ''}`}
            >
              Listado
            </ActionButton>
            <ActionButton
              type="button"
              variant="create"
              onClick={() => setViewMode('timeline')}
              className={`text-sm ${viewMode === 'timeline' ? 'ring-2 ring-green-400' : ''}`}
            >
              Timeline
            </ActionButton>
            <ActionButton
              type="button"
              variant="template"
              onClick={() => setViewMode('calendar')}
              className={`text-sm ${viewMode === 'calendar' ? 'ring-2 ring-purple-400' : ''}`}
            >
              Calendario
            </ActionButton>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ActionButton variant="refresh" icon={RefreshCw} onClick={handleRefresh}>
            Refrescar
          </ActionButton>
          <ActionButton variant="template" icon={FileDown} onClick={handleDownloadTemplate}>
            Plantilla
          </ActionButton>
          <label htmlFor="import-excel-input" className="cursor-pointer">
            <ActionButton variant="import" icon={Upload} onClick={() => document.getElementById('import-excel-input')?.click()}>
              Importar
            </ActionButton>
            <input
              id="import-excel-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <ActionButton variant="export" icon={Download} onClick={handleExportToExcel}>
            Exportar
          </ActionButton>
          {selectedSiteId && (
            <ActionButton variant="create" icon={Plus} onClick={() => handleOpenCreateModal()}>
              Nuevo
            </ActionButton>
          )}
        </div>
      </div>

      {/* Dashboard de Métricas */}
      {!isLoading && !isRecordsLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Vencidos"
            value={metrics.overdue}
            color="red"
            icon={AlertTriangle}
            subtitle="Requieren atención"
          />
          <StatsCard
            title="Próximos 7 días"
            value={metrics.upcoming}
            color="orange"
            icon={Clock}
            subtitle="Planificar pronto"
          />
          <StatsCard
            title="Completados este mes"
            value={metrics.completedThisMonth}
            color="green"
            icon={CheckCircle}
            subtitle="Realizados"
          />
          <StatsCard
            title="Compliance"
            value={metrics.complianceRate}
            color="blue"
            icon={TrendingUp}
            subtitle={`${metrics.complianceRate}% al día`}
          />
        </div>
      )}

      {viewMode === 'list' && (
        <DataTableFilters filters={filterConfigs} onFilterChange={handleFilterChange} />
      )}

      {viewMode === 'timeline' ? (
        <div className="card space-y-6">
          {isLoading || isRecordsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          ) : timelineGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No hay mantenimientos para mostrar</p>
            </div>
          ) : (
            timelineGroups.map(([dateKey, items]) => (
              <div key={dateKey} className="space-y-3">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {(parseDateOnly(dateKey) || new Date(dateKey)).toLocaleDateString('es-ES')}
                </div>
                <div className="space-y-2">
                  {items.map((item) => {
                    const Icon = getMaintenanceIcon(item.maintenanceType);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handlePlanClick(item.planId, item.type === 'record', {
                            performedAt: item.type === 'record' ? item.date : undefined,
                            scheduledDate: item.type === 'record' ? item.scheduledDate : undefined,
                            notes: item.type === 'record' ? item.notes : undefined,
                            incidents: item.type === 'record' ? item.incidents : undefined,
                            createdBy: item.type === 'record' ? item.createdBy : undefined,
                          })
                        }
                        className={`w-full text-left border-l-4 rounded-lg p-3 transition-colors ${
                          item.type === 'record'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 hover:bg-green-100/60 dark:hover:bg-green-900/30'
                            : item.status === 'Vencido'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 hover:bg-red-100/60 dark:hover:bg-red-900/30'
                              : item.status === 'Próximo'
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 hover:bg-orange-100/60 dark:hover:bg-orange-900/30'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 hover:bg-blue-100/60 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon size={18} className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <div className="font-semibold text-gray-900 dark:text-gray-100">
                              {item.title}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                item.type === 'record'
                                  ? 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                  : item.status === 'Vencido'
                                    ? 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                    : item.status === 'Próximo'
                                      ? 'bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                                      : 'bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              }`}
                            >
                              {item.type === 'record' ? 'Realizado' : item.status}
                            </span>
                            {item.type === 'plan' && item.daysInfo && (
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {item.daysInfo}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Activo: {item.assetTag}
                        </div>
                        {item.type === 'record' && (item.notes || item.incidents) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                            {item.notes && (
                              <div>
                                <span className="font-medium">Notas:</span> {item.notes}
                              </div>
                            )}
                            {item.incidents && (
                              <div>
                                <span className="font-medium">Incidencias:</span> {item.incidents}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <ActionButton
              type="button"
              variant="import"
              onClick={() => handleMonthChange(-1)}
              className="text-sm"
            >
              Mes anterior
            </ActionButton>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
              {monthLabel}
            </div>
            <ActionButton
              type="button"
              variant="create"
              onClick={() => handleMonthChange(1)}
              className="text-sm"
            >
              Mes siguiente
            </ActionButton>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-300 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900/40"></span>
              Programado
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-200 dark:bg-orange-900/40"></span>
              Próximo (7 días)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/40"></span>
              Vencido
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-200 dark:bg-green-900/40"></span>
              Realizado
            </div>
          </div>

          <div className="grid grid-cols-7 text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
            {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map((day) => (
              <div key={day} className="px-2 py-1 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            {calendarDays.map((dayInfo) => {
              const dateKey = toDateOnlyString(dayInfo.date);
              const items = calendarItemsByDate[dateKey] || [];
              const visibleItems = items.slice(0, 3);
              const extraCount = items.length - visibleItems.length;
              const holiday = holidaysByDate[dateKey];
              const isWeekend = dayInfo.date.getDay() === 0 || dayInfo.date.getDay() === 6;
              const isOutsideMonth = !dayInfo.isCurrentMonth;
              const isHolidayOrWeekend = isWeekend || !!holiday;
              const canCreate = !isOutsideMonth && !!selectedSiteId && !isHolidayOrWeekend;

              return (
                <div
                  key={dateKey}
                  role={canCreate ? 'button' : undefined}
                  tabIndex={canCreate ? 0 : undefined}
                  onClick={() => {
                    if (!canCreate) return;
                    handleOpenCreateModal(dateKey);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    if (!canCreate) return;
                    event.preventDefault();
                    handleOpenCreateModal(dateKey);
                  }}
                  className={`min-h-[120px] bg-white dark:bg-gray-800 p-2 ${
                    dayInfo.isCurrentMonth
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-500'
                  } ${
                    isOutsideMonth
                      ? 'bg-gray-50 dark:bg-gray-900/40'
                      : ''
                  } ${
                    isWeekend
                      ? 'bg-gray-100/80 text-gray-400 dark:bg-gray-900/60 dark:text-gray-500'
                      : holiday
                        ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-200'
                        : ''
                  } ${canCreate ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''} ${
                    isHolidayOrWeekend || isOutsideMonth ? 'cursor-not-allowed opacity-70' : ''
                  }`}
                >
                  <div className="text-xs font-semibold mb-2">{dayInfo.date.getDate()}</div>
                  {holiday && (
                    <div className="text-[10px] font-semibold text-rose-700 dark:text-rose-200 bg-rose-100/70 dark:bg-rose-900/40 px-2 py-0.5 rounded-md mb-2 truncate">
                      {holiday.name}
                    </div>
                  )}
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handlePlanClick(item.planId, item.type === 'record', {
                            performedAt: item.type === 'record' ? item.performedAt : undefined,
                            scheduledDate: item.type === 'record' ? item.scheduledDate : undefined,
                            notes: item.type === 'record' ? item.notes : undefined,
                            incidents: item.type === 'record' ? item.incidents : undefined,
                            createdBy: item.type === 'record' ? item.createdBy : undefined,
                          });
                        }}
                        className={`w-full text-left text-[11px] px-2 py-1 rounded-md border-l-4 transition-colors ${
                          item.type === 'record'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300 hover:bg-green-100/60 dark:hover:bg-green-900/30'
                            : item.status === 'Vencido'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300 hover:bg-red-100/60 dark:hover:bg-red-900/30'
                              : item.status === 'Próximo'
                                ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-700 dark:text-orange-300 hover:bg-orange-100/60 dark:hover:bg-orange-900/30'
                                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="truncate">{item.assetTag}</div>
                      </button>
                    ))}
                    {extraCount > 0 && (
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        +{extraCount} mas
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card">
          {isLoading || isRecordsLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
            </div>
          ) : (
            <DataTable
              data={listRows}
              columns={columns}
              keyExtractor={(item) => item.id}
              emptyMessage="No hay mantenimientos registrados"
            />
          )}
        </div>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Plan de Mantenimiento"
        titleBadge={
          selectedSite?.data && (
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold">
              {selectedSite.data.code}
            </span>
          )
        }
        size="xl"
      >
        <AssetMaintenancePlanForm
          mode="create"
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setCreatePrefillDate(null);
          }}
          initialNextDueDate={createPrefillDate}
        />
      </Modal>

      <Modal
        isOpen={!!selectedPlanId}
        onClose={handleDetailsModalClose}
        title="Detalles del Mantenimiento"
        size="xl"
        headerActions={
          <div className="flex items-center gap-2">
            {detailsHeaderActions}
            {detailsReadOnly && selectedPlanId && (
              <ActionButton
                variant="save"
                icon={Copy}
                onClick={() => handleDuplicatePlan(selectedPlanId)}
              >
                Duplicar
              </ActionButton>
            )}
          </div>
        }
      >
        {selectedPlanId && (
          <AssetMaintenancePlanForm
            mode="edit"
            planId={selectedPlanId}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] })}
            onCancel={handleDetailsModalClose}
            onHeaderButtons={setDetailsHeaderActions}
            onComplete={handleComplete}
            readOnly={detailsReadOnly}
            readOnlyDetails={detailsRecordInfo}
            readOnlyRecords={records
              .filter((record) => record.planId === selectedPlanId)
              .map((record) => ({
                id: record.id,
                performedAt: record.performedAt,
                scheduledDate: record.scheduledDate,
                notes: record.notes,
                incidents: record.incidents,
                createdBy: record.creator?.userName,
              }))
              .sort(
                (a, b) =>
                  new Date(b.performedAt || 0).getTime() - new Date(a.performedAt || 0).getTime()
              )}
          />
        )}
      </Modal>

      {completeMutation.isPending && (
        <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-4 py-2 rounded-lg flex items-center gap-2">
          <Wrench className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-gray-700 dark:text-gray-200">Registrando mantenimiento...</span>
        </div>
      )}
    </div>
  );
}
