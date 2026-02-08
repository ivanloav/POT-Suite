import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetStorageFormFactorService } from '@/services/assetStorageFormFactorService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetStorageFormFactorFormData {
  code: string;
  name: string;
  isActive: boolean;
}

interface AssetStorageFormFactorFormProps {
  mode: 'create' | 'edit';
  formFactorId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetStorageFormFactorForm({ mode, formFactorId, onSuccess, onCancel, onHeaderButtons }: AssetStorageFormFactorFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs');

  const { data, isLoading } = useQuery({
    queryKey: ['asset-storage-form-factors', formFactorId],
    queryFn: () => assetStorageFormFactorService.getById(formFactorId!),
    enabled: mode === 'edit' && !!formFactorId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetStorageFormFactorFormData>({
    defaultValues: {
      code: '',
      name: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        code: data.code,
        name: data.name,
        isActive: data.isActive,
      });
    }
  }, [data, reset]);

  useEffect(() => {
    if (mode === 'edit' && onHeaderButtons) {
      if (isEditing) {
        onHeaderButtons(
          <div className="flex gap-2">
            <ActionButton
              type="button"
              variant="cancel"
              icon={X}
              onClick={() => {
                setIsEditing(false);
                reset({
                  code: data?.code,
                  name: data?.name,
                  isActive: data?.isActive,
                });
              }}
            >
              Cancelar
            </ActionButton>
            <ActionButton
              type="submit"
              variant="save"
              icon={Save}
              onClick={handleSubmit(onSubmit)}
            >
              Guardar
            </ActionButton>
          </div>
        );
      } else if (canEdit) {
        onHeaderButtons(
          <ActionButton
            type="button"
            variant="edit"
            icon={Edit2}
            onClick={() => setIsEditing(true)}
          >
            Editar
          </ActionButton>
        );
      } else {
        onHeaderButtons(null);
      }
    }
  }, [mode, isEditing, canEdit, onHeaderButtons, data, reset, handleSubmit]);

  const createMutation = useMutation({
    mutationFn: assetStorageFormFactorService.create,
    onSuccess: () => {
      toast.success('Form factor de almacenamiento creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asset-storage-form-factors'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el form factor');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssetStorageFormFactorFormData }) =>
      assetStorageFormFactorService.update(id, data),
    onSuccess: () => {
      toast.success('Form factor de almacenamiento actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asset-storage-form-factors'] });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el form factor');
    },
  });

  const onSubmit = (formData: AssetStorageFormFactorFormData) => {
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else if (formFactorId) {
      updateMutation.mutate({ id: formFactorId, data: formData });
    }
  };

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Código */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('code', { required: 'El código es obligatorio' })}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          placeholder="Ej: 2.5"
        />
        {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name', { required: 'El nombre es obligatorio' })}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          placeholder="Ej: 2.5&quot; (63.5mm)"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      {/* Estado - Solo en modo edición */}
      {mode === 'edit' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('isActive')}
                disabled={!isEditing}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                {data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Información del Sistema - Solo en modo edición */}
      {mode === 'edit' && data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.createdAt ? new Date(data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.updatedAt ? new Date(data.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción - Solo en modo crear */}
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
            Crear Form Factor
          </ActionButton>
        </div>
      )}
    </form>
  );
}
