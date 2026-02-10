import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { assetsService } from '@/services/assetsService';
import { assetMaintenancePlansService } from '@/services/assetMaintenancePlansService';
import { assetMaintenanceTypesService } from '@/services/assetMaintenanceTypesService';
import { ActionButton } from '@/components/shared/ActionButton';
import { Edit2, Save, X, CheckCircle2 } from 'lucide-react';

interface AssetMaintenancePlanFormData {
  siteId?: number;
  assetId?: number;
  title: string;
  maintenanceType?: string;
  description?: string;
  isRecurring: boolean;
  frequencyDays?: number;
  nextDueDate: string;
  isActive: boolean;
}

interface AssetMaintenancePlanFormProps {
  mode: 'create' | 'edit';
  planId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
  onComplete?: (data: { notes?: string; incidents?: string }) => void;
  initialNextDueDate?: string | null;
  readOnly?: boolean;
  readOnlyDetails?: {
    performedAt?: string;
    scheduledDate?: string;
    notes?: string;
    incidents?: string;
    createdBy?: string;
  } | null;
  readOnlyRecords?: Array<{
    id: number;
    performedAt?: string;
    scheduledDate?: string;
    notes?: string;
    incidents?: string;
    createdBy?: string;
  }>;
}

export default function AssetMaintenancePlanForm({
  mode,
  planId,
  onSuccess,
  onCancel,
  onHeaderButtons,
  onComplete,
  initialNextDueDate = null,
  readOnly = false,
  readOnlyDetails = null,
  readOnlyRecords = [],
}: AssetMaintenancePlanFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create' && !readOnly);
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeIncidents, setCompleteIncidents] = useState('');
  const isReadOnly = mode === 'edit' && readOnly;

  const { data: planData, isLoading } = useQuery({
    queryKey: ['asset-maintenance-plans', planId],
    queryFn: () => assetMaintenancePlansService.getById(planId!),
    enabled: mode === 'edit' && !!planId,
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetMaintenancePlanFormData>({
    defaultValues: {
      isActive: true,
      isRecurring: true,
      siteId: selectedSiteId || undefined,
    },
  });

  const { data: assetsData } = useQuery({
    queryKey: ['assets', selectedSiteId],
    queryFn: () => assetsService.getAll({ siteId: selectedSiteId || undefined }),
    enabled: !!selectedSiteId,
  });

  const { data: maintenanceTypesData } = useQuery({
    queryKey: ['asset-maintenance-types', 'active'],
    queryFn: () => assetMaintenanceTypesService.getAll({ isActive: true }),
  });

  useEffect(() => {
    if (mode === 'edit' && planData?.data) {
      const plan = planData.data;
      reset({
        siteId: plan.siteId,
        assetId: plan.assetId,
        title: plan.title,
        maintenanceType: plan.maintenanceType || '',
        description: plan.description || '',
        isRecurring: plan.isRecurring ?? true,
        frequencyDays: plan.frequencyDays ?? undefined,
        nextDueDate: plan.nextDueDate?.split('T')[0] || plan.nextDueDate,
        isActive: plan.isActive,
      });
    }
  }, [planData, reset, mode]);

  useEffect(() => {
    if (mode === 'create' && selectedSiteId) {
      reset({
        ...getValues(),
        siteId: selectedSiteId,
      });
      setValue('assetId', undefined);
    }
  }, [mode, selectedSiteId, reset, getValues, setValue]);

  useEffect(() => {
    if (mode === 'create' && initialNextDueDate) {
      setValue('nextDueDate', initialNextDueDate);
    }
  }, [mode, initialNextDueDate, setValue]);

  const createMutation = useMutation({
    mutationFn: assetMaintenancePlansService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
      toast.success('Plan de mantenimiento creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetMaintenancePlanFormData) =>
      assetMaintenancePlansService.update(planId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans', planId] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-plans'] });
      toast.success('Plan actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el plan');
    },
  });

  const onSubmit = (data: AssetMaintenancePlanFormData) => {
    const payload: AssetMaintenancePlanFormData = {
      ...data,
      isRecurring: data.isRecurring !== false,
      frequencyDays: data.isRecurring === false ? undefined : data.frequencyDays,
    };
    if (mode === 'create') {
      if (!selectedSiteId || !data.assetId) {
        toast.error('Debes seleccionar el activo');
        return;
      }
      createMutation.mutate({
        ...payload,
        siteId: selectedSiteId,
        assetId: data.assetId,
      });
    } else {
      updateMutation.mutate(payload);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (planData?.data) {
      const plan = planData.data;
      reset({
        siteId: plan.siteId,
        assetId: plan.assetId,
        title: plan.title,
        maintenanceType: plan.maintenanceType || '',
        description: plan.description || '',
        isRecurring: plan.isRecurring ?? true,
        frequencyDays: plan.frequencyDays ?? undefined,
        nextDueDate: plan.nextDueDate?.split('T')[0] || plan.nextDueDate,
        isActive: plan.isActive,
      });
    }
  };

  useEffect(() => {
    if (mode === 'edit' && onHeaderButtons) {
      if (isReadOnly) {
        onHeaderButtons(null);
        return;
      }
      const headerButtons = (
        <>
          {!isEditing && (
            <ActionButton variant="edit" icon={Edit2} onClick={handleEdit}>
              Editar
            </ActionButton>
          )}
          {isEditing && (
            <>
              <ActionButton
                type="submit"
                variant="save"
                icon={Save}
                form="asset-maintenance-plan-form"
                loading={updateMutation.isPending}
                loadingText="Guardando..."
              >
                Guardar
              </ActionButton>
              <ActionButton
                type="button"
                variant="cancel"
                icon={X}
                onClick={handleCancelEdit}
              >
                Cancelar
              </ActionButton>
            </>
          )}
        </>
      );
      onHeaderButtons(headerButtons);
    }
  }, [isEditing, updateMutation.isPending, onHeaderButtons, mode, isReadOnly]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isDisabled = mode === 'edit' && (!isEditing || isReadOnly);
  const plan = mode === 'edit' ? planData?.data : null;
  const maintenanceTypes = maintenanceTypesData?.data || [];
  const maintenanceTypeCodes = new Set(maintenanceTypes.map((type: any) => type.code));
  const isRecurring = watch('isRecurring');
  const isOneTime = isRecurring === false;

  return (
    <form id="asset-maintenance-plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información del Mantenimiento
        </h3>

        <input type="hidden" {...register('siteId', { valueAsNumber: true })} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="maintenance-asset"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Activo <span className="text-red-500">*</span>
            </label>
            <select
              id="maintenance-asset"
              {...register('assetId', { required: 'El activo es obligatorio', valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar activo</option>
              {assetsData?.data?.map((asset: any) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetTag} {asset.serial ? `(${asset.serial})` : ''}
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-red-500 text-sm mt-1">{errors.assetId.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="maintenance-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="maintenance-title"
              {...register('title', { required: 'El título es obligatorio' })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Limpieza de cabezal y rodillos"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="maintenance-type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tipo de mantenimiento
            </label>
            <select
              id="maintenance-type"
              {...register('maintenanceType')}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar tipo</option>
              {plan?.maintenanceType && !maintenanceTypeCodes.has(plan.maintenanceType) && (
                <option value={plan.maintenanceType}>{plan.maintenanceType}</option>
              )}
              {maintenanceTypes.map((type: any) => (
                <option key={type.code} value={type.code}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="maintenance-frequency"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Frecuencia (días) {!isOneTime && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              id="maintenance-frequency"
              {...register('frequencyDays', {
                valueAsNumber: true,
                min: { value: 1, message: 'La frecuencia debe ser mayor a 0' },
                validate: (value) =>
                  !isRecurring || (!!value && !Number.isNaN(value)) || 'La frecuencia es obligatoria',
              })}
              disabled={isDisabled || isOneTime}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="30"
            />
            {errors.frequencyDays && (
              <p className="text-red-500 text-sm mt-1">{errors.frequencyDays.message}</p>
            )}
          </div>

          <div>
            <input type="hidden" {...register('isRecurring')} />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recurrencia
            </label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isOneTime}
                  onChange={(event) => setValue('isRecurring', event.target.checked)}
                  disabled={isDisabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {isOneTime ? 'Solo una vez' : 'Recurrente'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="maintenance-next-due"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Próxima fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="maintenance-next-due"
              {...register('nextDueDate', { required: 'La fecha es obligatoria' })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {errors.nextDueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.nextDueDate.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="maintenance-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Descripción
            </label>
            <textarea
              id="maintenance-description"
              {...register('description')}
              disabled={isDisabled}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Detalles del procedimiento de mantenimiento"
            />
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    disabled={isDisabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {plan?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {mode === 'edit' && !isReadOnly && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Registrar mantenimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="maintenance-complete-notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Notas
              </label>
              <textarea
                id="maintenance-complete-notes"
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Observaciones generales"
              />
            </div>
            <div>
              <label
                htmlFor="maintenance-complete-incidents"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Incidencias
              </label>
              <textarea
                id="maintenance-complete-incidents"
                value={completeIncidents}
                onChange={(e) => setCompleteIncidents(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                placeholder="Si hubo incidencias, detállalas aquí"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <ActionButton
              type="button"
              variant="save"
              icon={CheckCircle2}
              onClick={() => onComplete?.({ notes: completeNotes, incidents: completeIncidents })}
            >
              Marcar realizado
            </ActionButton>
          </div>
        </div>
      )}

      {mode === 'edit' && isReadOnly && readOnlyDetails && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Mantenimiento realizado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {readOnlyDetails.performedAt
                  ? new Date(readOnlyDetails.performedAt).toLocaleString('es-ES')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Fecha planificada:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {readOnlyDetails.scheduledDate
                  ? new Date(readOnlyDetails.scheduledDate).toLocaleDateString('es-ES')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Registrado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {readOnlyDetails.createdBy || 'N/A'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Notas:</span>
              <div className="mt-1 text-gray-900 dark:text-gray-100">
                {readOnlyDetails.notes || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Incidencias:</span>
              <div className="mt-1 text-gray-900 dark:text-gray-100">
                {readOnlyDetails.incidents || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'edit' && isReadOnly && readOnlyRecords.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Historial de mantenimientos
          </h3>
          <div className="space-y-3">
            {readOnlyRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {record.performedAt
                      ? new Date(record.performedAt).toLocaleString('es-ES')
                      : 'Fecha N/A'}
                  </div>
                  {record.scheduledDate && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Planificado: {new Date(record.scheduledDate).toLocaleDateString('es-ES')}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {record.createdBy || 'N/A'}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Notas:</span>
                    <div className="mt-1 text-gray-900 dark:text-gray-100">
                      {record.notes || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Incidencias:</span>
                    <div className="mt-1 text-gray-900 dark:text-gray-100">
                      {record.incidents || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'edit' && plan && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {plan.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {plan.createdAt ? new Date(plan.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {plan.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {plan.updatedAt ? new Date(plan.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
          <ActionButton type="button" variant="cancel" icon={X} onClick={onCancel}>
            Cancelar
          </ActionButton>
          <ActionButton
            type="submit"
            variant="save"
            icon={Save}
            loading={createMutation.isPending}
            loadingText="Creando..."
          >
            Crear Plan
          </ActionButton>
        </div>
      )}
    </form>
  );
}
