import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetMaintenanceTypesService } from '@/services/assetMaintenanceTypesService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetMaintenanceTypeFormData {
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

interface AssetMaintenanceTypeFormProps {
  mode: 'create' | 'edit';
  typeId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetMaintenanceTypeForm({
  mode,
  typeId,
  onSuccess,
  onCancel,
  onHeaderButtons,
}: AssetMaintenanceTypeFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs');

  const { data: typeData, isLoading } = useQuery({
    queryKey: ['asset-maintenance-types', typeId],
    queryFn: () => assetMaintenanceTypesService.getById(typeId!),
    enabled: mode === 'edit' && !!typeId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetMaintenanceTypeFormData>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && typeData?.data) {
      const type = typeData.data;
      reset({
        code: type.code,
        name: type.name,
        description: type.description || '',
        sortOrder: type.sortOrder,
        isActive: type.isActive,
      });
    }
  }, [typeData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: assetMaintenanceTypesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-types'] });
      toast.success('Tipo de mantenimiento creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetMaintenanceTypeFormData) =>
      assetMaintenanceTypesService.update(typeId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-types', typeId] });
      queryClient.invalidateQueries({ queryKey: ['asset-maintenance-types'] });
      toast.success('Tipo actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo');
    },
  });

  const onSubmit = (data: AssetMaintenanceTypeFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (typeData?.data) {
      const type = typeData.data;
      reset({
        code: type.code,
        name: type.name,
        description: type.description || '',
        sortOrder: type.sortOrder,
        isActive: type.isActive,
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
                form="asset-maintenance-type-form"
                loading={updateMutation.isPending}
                loadingText="Guardando..."
              >
                Guardar
              </ActionButton>
              <ActionButton type="button" variant="cancel" icon={X} onClick={handleCancelEdit}>
                Cancelar
              </ActionButton>
            </>
          )}
        </>
      );
      onHeaderButtons(headerButtons);
    }
  }, [isEditing, mode, onHeaderButtons, canEdit, updateMutation.isPending]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form id="asset-maintenance-type-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Codigo *
        </label>
        <input
          type="text"
          {...register('code', { required: 'El codigo es requerido' })}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          placeholder="printer_cleaning"
        />
        {errors.code && (
          <span className="text-sm text-red-600 dark:text-red-400">{errors.code.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre *
        </label>
        <input
          type="text"
          {...register('name', { required: 'El nombre es requerido' })}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <span className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripcion
        </label>
        <textarea
          {...register('description')}
          disabled={!isEditing}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
          placeholder="Detalles del tipo de mantenimiento"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Orden de clasificacion
        </label>
        <input
          type="number"
          {...register('sortOrder', { valueAsNumber: true })}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
      </div>

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
                {typeData?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {mode === 'edit' && typeData?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Informacion del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {typeData.data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {typeData.data.createdAt ? new Date(typeData.data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {typeData.data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {typeData.data.updatedAt ? new Date(typeData.data.updatedAt).toLocaleString('es-ES') : 'N/A'}
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
            Crear Tipo
          </ActionButton>
        </div>
      )}
    </form>
  );
}
