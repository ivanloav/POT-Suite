import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AssetStorageService } from '@/services/assetStorageService';
import { assetStorageDriveTypeService } from '@/services/assetStorageDriveTypeService';
import { assetStorageInterfaceService } from '@/services/assetStorageInterfaceService';
import { assetStorageFormFactorService } from '@/services/assetStorageFormFactorService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetStorageFormData {
  capacityGb: number;
  driveTypeId: number;
  interfaceId?: number;
  formFactorId?: number;
  notes?: string;
  isActive: boolean;
}

interface AssetStorageFormProps {
  mode: 'create' | 'edit';
  storageId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetStorageForm({ mode, storageId, onSuccess, onCancel, onHeaderButtons }: AssetStorageFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('assetStorage');

  const { data: storageData, isLoading } = useQuery({
    queryKey: ['asset-storage', storageId],
    queryFn: () => AssetStorageService.getById(storageId!),
    enabled: mode === 'edit' && !!storageId,
  });

  const { data: driveTypesData } = useQuery({
    queryKey: ['storage-drive-types'],
    queryFn: () => assetStorageDriveTypeService.getAll(),
  });

  const { data: interfacesData } = useQuery({
    queryKey: ['storage-interfaces'],
    queryFn: () => assetStorageInterfaceService.getAll(),
  });

  const { data: formFactorsData } = useQuery({
    queryKey: ['storage-form-factors'],
    queryFn: () => assetStorageFormFactorService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetStorageFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && storageData?.data) {
      const storage = storageData.data;
      reset({
        capacityGb: storage.capacityGb,
        driveTypeId: storage.driveTypeId,
        interfaceId: storage.interfaceId || undefined,
        formFactorId: storage.formFactorId || undefined,
        notes: storage.notes,
        isActive: storage.isActive,
      });
    }
  }, [storageData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: AssetStorageService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-storage'] });
      toast.success('Almacenamiento creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el almacenamiento');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetStorageFormData) => AssetStorageService.update(storageId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-storage', storageId] });
      queryClient.invalidateQueries({ queryKey: ['asset-storage'] });
      toast.success('Almacenamiento actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el almacenamiento');
    },
  });

  const onSubmit = (data: AssetStorageFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (storageData?.data) {
      const storage = storageData.data;
      reset({
        capacityGb: storage.capacityGb,
        driveTypeId: storage.driveTypeId,
        interfaceId: storage.interfaceId || undefined,
        formFactorId: storage.formFactorId || undefined,
        notes: storage.notes,
        isActive: storage.isActive,
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
                form="assetstorage-form"
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

  const storage = mode === 'edit' ? storageData?.data : null;
  const isDisabled = mode === 'edit' && !isEditing;

  return (
    <form id="assetstorage-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              {[128, 256, 512, 1024, 2048, 4096, 8192].map(gb => (
                <option key={gb} value={gb}>{gb} GB</option>
              ))}
            </select>
            {errors.capacityGb && (
              <p className="text-red-500 text-sm mt-1">{errors.capacityGb.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Disco <span className="text-red-500">*</span>
            </label>
            <select
              {...register('driveTypeId', { 
                required: 'El tipo de disco es obligatorio',
                valueAsNumber: true 
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar tipo</option>
              {driveTypesData?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.driveTypeId && (
              <p className="text-red-500 text-sm mt-1">{errors.driveTypeId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interfaz
            </label>
            <select
              {...register('interfaceId', { valueAsNumber: true })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin especificar</option>
              {interfacesData?.map((iface: any) => (
                <option key={iface.id} value={iface.id}>
                  {iface.name}
                </option>
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
              {formFactorsData?.map((factor: any) => (
                <option key={factor.id} value={factor.id}>
                  {factor.name}
                </option>
              ))}
            </select>
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
                    {storage?.isActive ? 'Activo' : 'Inactivo'}
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

      {mode === 'edit' && storage && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {storage.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {storage.createdAt ? new Date(storage.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {storage.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {storage.updatedAt ? new Date(storage.updatedAt).toLocaleString('es-ES') : 'N/A'}
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
            Crear Almacenamiento
          </ActionButton>
        </div>
      )}
    </form>
  );
}
