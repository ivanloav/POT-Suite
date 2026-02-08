import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetRamService } from '@/services/assetRamService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetRAMFormData {
  capacityGb: number;
  memTypeId: number;
  speedMts?: number;
  formFactorId?: number;
  notes?: string;
  isActive: boolean;
}

interface AssetRAMFormProps {
  mode: 'create' | 'edit';
  assetRAMId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetRAMForm({ mode, assetRAMId, onSuccess, onCancel, onHeaderButtons }: AssetRAMFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('assetRAM');

  const { data: assetRamData, isLoading } = useQuery({
    queryKey: ['asset-ram', assetRAMId],
    queryFn: () => AssetRamService.getById(assetRAMId!),
    enabled: mode === 'edit' && !!assetRAMId,
  });

  const { data: memTypesData } = useQuery({
    queryKey: ['ram-mem-types'],
    queryFn: () => AssetRamService.getMemoryTypes(),
  });

  const { data: formFactorsData } = useQuery({
    queryKey: ['ram-form-factors'],
    queryFn: () => AssetRamService.getFormFactors(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetRAMFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && assetRamData?.data) {
      const ram = assetRamData.data;
      reset({
        capacityGb: ram.capacityGb,
        memTypeId: ram.memTypeId,
        speedMts: ram.speedMts,
        formFactorId: ram.formFactorId,
        notes: ram.notes,
        isActive: ram.isActive,
      });
    }
  }, [assetRamData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: AssetRamService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-ram'] });
      toast.success('RAM creada exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la RAM');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetRAMFormData) => AssetRamService.update(assetRAMId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-ram', assetRAMId] });
      queryClient.invalidateQueries({ queryKey: ['asset-ram'] });
      toast.success('RAM actualizada exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la RAM');
    },
  });

  const onSubmit = (data: AssetRAMFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (assetRamData?.data) {
      const ram = assetRamData.data;
      reset({
        capacityGb: ram.capacityGb,
        memTypeId: ram.memTypeId,
        speedMts: ram.speedMts,
        formFactorId: ram.formFactorId,
        notes: ram.notes,
        isActive: ram.isActive,
      });
    }
  };

  useEffect(() => {
    if (mode === 'edit' && onHeaderButtons) {
      const headerButtons = (
        <>
          {canEdit && !isEditing && (
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
                form="assetram-form"
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
  }, [isEditing, updateMutation.isPending, canEdit, onHeaderButtons, mode]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const assetRam = mode === 'edit' ? assetRamData?.data : null;
  const isDisabled = mode === 'edit' && !isEditing;

  return (
    <form id="assetram-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Capacidad (GB) <span className="text-red-500">*</span>
            </label>
            <select
              {...register('capacityGb', { 
                required: 'La capacidad es obligatoria',
                valueAsNumber: true 
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar capacidad</option>
              {[2, 4, 8, 16, 32, 64, 128, 256].map(gb => (
                <option key={gb} value={gb}>{gb} GB</option>
              ))}
            </select>
            {errors.capacityGb && (
              <p className="text-red-500 text-sm mt-1">{errors.capacityGb.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Memoria <span className="text-red-500">*</span>
            </label>
            <select
              {...register('memTypeId', { 
                required: 'El tipo de memoria es obligatorio',
                valueAsNumber: true 
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar tipo</option>
              {memTypesData?.data?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.memTypeId && (
              <p className="text-red-500 text-sm mt-1">{errors.memTypeId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Velocidad (MT/s)
            </label>
            <select
              {...register('speedMts', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              {[1600, 1866, 2133, 2400, 2666, 2933, 3200, 3600, 4000, 4400, 4800, 5200, 5600, 6000, 6400, 6800, 7200].map(speed => (
                <option key={speed} value={speed}>{speed} MT/s</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Form Factor
            </label>
            <select
              {...register('formFactorId', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              {formFactorsData?.data?.map((factor: any) => (
                <option key={factor.id} value={factor.id}>
                  {factor.name}
                </option>
              ))}
            </select>
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
                    {assetRam?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Información adicional..."
            />
          </div>
        </div>
      </div>

      {mode === 'edit' && assetRam && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetRam.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetRam.createdAt ? new Date(assetRam.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetRam.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetRam.updatedAt ? new Date(assetRam.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex gap-3 justify-end pt-4 border-t dark:border-gray-700">
          <ActionButton
            type="button"
            variant="cancel"
            icon={X}
            onClick={onCancel}
          >
            Cancelar
          </ActionButton>
          <ActionButton
            type="submit"
            variant="save"
            icon={Save}
            loading={createMutation.isPending}
            loadingText="Creando..."
          >
            Crear RAM
          </ActionButton>
        </div>
      )}
    </form>
  );
}
