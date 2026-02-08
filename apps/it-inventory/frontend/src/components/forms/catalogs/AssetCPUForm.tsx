import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetCpuService } from '@/services/assetCpuService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetCPUFormData {
  vendorId: number;
  model: string;
  segmentId?: number;
  cores?: number;
  threads?: number;
  baseGhz?: number;
  boostGhz?: number;
  notes?: string;
  isActive?: boolean;
}

interface AssetCPUFormProps {
  mode: 'create' | 'edit';
  assetCPUId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetCPUForm({ mode, assetCPUId, onSuccess, onCancel, onHeaderButtons }: AssetCPUFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('assetCPU');

  const { data: assetCpuData, isLoading } = useQuery({
    queryKey: ['asset-cpu', assetCPUId],
    queryFn: () => AssetCpuService.getById(assetCPUId!),
    enabled: mode === 'edit' && !!assetCPUId,
  });

  const { data: vendorsData } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => AssetCpuService.getVendors(),
  });

  const { data: segmentsData } = useQuery({
    queryKey: ['segments'],
    queryFn: () => AssetCpuService.getSegments(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetCPUFormData>();

  useEffect(() => {
    if (mode === 'edit' && assetCpuData?.data) {
      const assetCpu = assetCpuData.data;
      reset({
        vendorId: assetCpu.vendorId,
        model: assetCpu.model,
        segmentId: assetCpu.segmentId,
        cores: assetCpu.cores,
        threads: assetCpu.threads,
        baseGhz: assetCpu.baseGhz,
        boostGhz: assetCpu.boostGhz,
        notes: assetCpu.notes,
        isActive: assetCpu.isActive,
      });
    }
  }, [assetCpuData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: AssetCpuService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-cpu'] });
      toast.success('CPU creada exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la CPU');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetCPUFormData) => AssetCpuService.update(assetCPUId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-cpu', assetCPUId] });
      queryClient.invalidateQueries({ queryKey: ['asset-cpu'] });
      toast.success('CPU actualizada exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la CPU');
    },
  });

  const onSubmit = (data: AssetCPUFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (assetCpuData?.data) {
      const assetCpu = assetCpuData.data;
      reset({
        vendorId: assetCpu.vendorId,
        model: assetCpu.model,
        segmentId: assetCpu.segmentId,
        cores: assetCpu.cores,
        threads: assetCpu.threads,
        baseGhz: assetCpu.baseGhz,
        boostGhz: assetCpu.boostGhz,
        notes: assetCpu.notes,
        isActive: assetCpu.isActive,
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
                form="assetcpu-form"
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

  const assetCpu = mode === 'edit' ? assetCpuData?.data : null;
  const isDisabled = mode === 'edit' && !isEditing;

  return (
    <form id="assetcpu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fabricante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fabricante <span className="text-red-500">*</span>
            </label>
            <select
              {...register('vendorId', { 
                required: 'El fabricante es obligatorio',
                valueAsNumber: true 
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar fabricante</option>
              {vendorsData?.data?.map((vendor: any) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.id} - {vendor.name}
                </option>
              ))}
            </select>
            {errors.vendorId && (
              <p className="text-red-500 text-sm mt-1">{errors.vendorId.message}</p>
            )}
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modelo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('model', { 
                required: 'El modelo es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Core i9-14900K"
            />
            {errors.model && (
              <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
            )}
          </div>

          {/* Segmento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Segmento
            </label>
            <select
              {...register('segmentId', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar segmento</option>
              {segmentsData?.data?.map((segment: any) => (
                <option key={segment.id} value={segment.id}>
                  {segment.id} - {segment.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cores */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cores
            </label>
            <select
              {...register('cores', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              {[1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 64, 96, 128].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Threads */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Threads
            </label>
            <select
              {...register('threads', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              {[1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 28, 32, 40, 48, 56, 64, 96, 128, 192, 256].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Base GHz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base GHz
            </label>
            <input
              type="number"
              step="0.1"
              {...register('baseGhz', { 
                min: { value: 0.1, message: 'Mínimo 0.1 GHz' },
                valueAsNumber: true
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="3.2"
            />
            {errors.baseGhz && (
              <p className="text-red-500 text-sm mt-1">{errors.baseGhz.message}</p>
            )}
          </div>

          {/* Boost GHz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Boost GHz
            </label>
            <input
              type="number"
              step="0.1"
              {...register('boostGhz', { 
                min: { value: 0.1, message: 'Mínimo 0.1 GHz' },
                valueAsNumber: true
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="6.0"
            />
            {errors.boostGhz && (
              <p className="text-red-500 text-sm mt-1">{errors.boostGhz.message}</p>
            )}
          </div>

          {/* Estado (solo en modo edit) */}
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
                    {assetCpu?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notas */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información Adicional
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas
          </label>
          <textarea
            {...register('notes')}
            rows={4}
            disabled={isDisabled}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            placeholder="Información adicional..."
          />
        </div>
      </div>

      {/* Metadatos (solo en modo edit) */}
      {mode === 'edit' && assetCpu && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetCpu.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetCpu.createdAt ? new Date(assetCpu.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetCpu.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {assetCpu.updatedAt ? new Date(assetCpu.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones (solo en modo create) */}
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
            Crear CPU
          </ActionButton>
        </div>
      )}
    </form>
  );
}
