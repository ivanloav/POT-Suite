import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { catalogsService } from '@/services/catalogsService';
import { AssetOsVersionsService } from '@/services/assetOsVersionsService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetOSVersionFormData {
  osFamilyId: number;
  name: string;
  isActive: boolean;
}

interface AssetOSVersionFormProps {
  mode: 'create' | 'edit';
  osVersionId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetOSVersionForm({ mode, osVersionId, onSuccess, onCancel, onHeaderButtons }: AssetOSVersionFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('osVersions');

  const { data: osVersionData, isLoading } = useQuery({
    queryKey: ['asset-os', osVersionId],
    queryFn: () => AssetOsVersionsService.getById(osVersionId!),
    enabled: mode === 'edit' && !!osVersionId,
  });

  const { data: osFamiliesData } = useQuery({
    queryKey: ['os-families'],
    queryFn: () => catalogsService.getOsFamilies(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetOSVersionFormData>();

  useEffect(() => {
    if (mode === 'edit' && osVersionData?.data) {
      const osVersion = osVersionData.data;
      reset({
        osFamilyId: osVersion.osFamilyId,
        name: osVersion.name,
        isActive: osVersion.isActive,
      });
    }
  }, [osVersionData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: AssetOsVersionsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-os'] });
      toast.success('S.O. creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la versión de S.O.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetOSVersionFormData) => AssetOsVersionsService.update(osVersionId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-os', osVersionId] });
      queryClient.invalidateQueries({ queryKey: ['asset-os'] });
      toast.success('Versión de S.O. actualizada exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la versión de S.O.');
    },
  });

  const onSubmit = (data: AssetOSVersionFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (osVersionData?.data) {
      const osVersion = osVersionData.data;
      reset({
        osFamilyId: osVersion.osFamilyId,
        name: osVersion.name,
        isActive: osVersion.isActive,
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
                form="osversion-form"
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

  const osVersion = mode === 'edit' ? osVersionData?.data : null;
  const isDisabled = mode === 'edit' && !isEditing;

  return (
    <form id="osversion-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Família <span className="text-red-500">*</span>
            </label>
            <select
              {...register('osFamilyId', { 
                required: 'La família es obligatoria',
                valueAsNumber: true 
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar família</option>
              {osFamiliesData?.data?.map((osFamily: any) => (
                <option key={osFamily.id} value={osFamily.id}>
                  {osFamily.id} - {osFamily.name}
                </option>
              ))}
            </select>
            {errors.osFamilyId && (
              <p className="text-red-500 text-sm mt-1">{errors.osFamilyId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', { 
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="macOS Sequoia 15.3"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
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
                    {osVersion?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {mode === 'edit' && osVersion && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {osVersion.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {osVersion.createdAt ? new Date(osVersion.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {osVersion.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {osVersion.updatedAt ? new Date(osVersion.updatedAt).toLocaleString('es-ES') : 'N/A'}
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
            Crear S.O.
          </ActionButton>
        </div>
      )}
    </form>
  );
}
