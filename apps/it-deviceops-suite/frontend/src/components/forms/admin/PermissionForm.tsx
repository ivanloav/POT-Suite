import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import permissionsAdminService from '@/services/permissionsAdminService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X, Info } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface PermissionFormData {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface PermissionFormProps {
  mode: 'create' | 'edit';
  permissionId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function PermissionForm({ mode, permissionId, onSuccess, onCancel, onHeaderButtons }: PermissionFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('users');

  const { data, isLoading } = useQuery({
    queryKey: ['permissions-admin', permissionId],
    queryFn: () => permissionsAdminService.getById(permissionId!),
    enabled: mode === 'edit' && !!permissionId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PermissionFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && data) {
      reset({
        code: data.code,
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
      });
    }
  }, [data, reset, mode]);

  const createMutation = useMutation({
    mutationFn: permissionsAdminService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
      toast.success('Permiso creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el permiso');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: PermissionFormData) => permissionsAdminService.update(permissionId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions-admin', permissionId] });
      queryClient.invalidateQueries({ queryKey: ['permissions-admin'] });
      toast.success('Permiso actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el permiso');
    },
  });

  const onSubmit = (formData: PermissionFormData) => {
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        code: data.code,
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
      });
    }
  };

  // useRef pattern to avoid infinite loop with onHeaderButtons callback
  const onHeaderButtonsRef = useRef(onHeaderButtons);
  useEffect(() => {
    onHeaderButtonsRef.current = onHeaderButtons;
  }, [onHeaderButtons]);

  useEffect(() => {
    if (mode === 'edit' && onHeaderButtonsRef.current) {
      if (isEditing) {
        onHeaderButtonsRef.current(
          <>
            <ActionButton variant="cancel" icon={X} onClick={handleCancelEdit}>
              Cancelar
            </ActionButton>
            <ActionButton
              variant="save"
              icon={Save}
              onClick={handleSubmit(onSubmit)}
              loading={updateMutation.isPending}
              loadingText="Guardando..."
            >
              Guardar
            </ActionButton>
          </>
        );
      } else {
        if (canEdit) {
          onHeaderButtonsRef.current(
            <ActionButton variant="edit" icon={Edit2} onClick={handleEdit}>
              Editar
            </ActionButton>
          );
        } else {
          onHeaderButtonsRef.current(null);
        }
      }
    }
    return () => {
      if (mode === 'edit' && onHeaderButtonsRef.current) {
        onHeaderButtonsRef.current(null);
      }
    };
  }, [isEditing, mode, canEdit, updateMutation.isPending]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Cuadro informativo sobre patrones de permisos */}
      {mode === 'create' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Patrón: <code className="bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-xs">recurso.accion</code>
              </h4>
              <div className="space-y-2">
                <p className="text-xs">
                  <strong>Acciones válidas:</strong> <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">read</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">create</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">update</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">delete</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">retire</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">admin</code>
                </p>
                <p className="text-xs">
                  <strong>Ejemplos:</strong> <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">assets.read</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">employees.create</code>, <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">system.admin</code>
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded p-2 mt-2">
                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                    ⚠️ <strong>NO usar .manage</strong> - La función <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">canManage()</code> detecta automáticamente si el usuario tiene permisos de escritura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('code', {
            required: 'El código es requerido',
            pattern: {
              value: /^[a-zA-Z]+\.(read|create|update|delete|retire|admin)$/,
              message: 'Formato: recurso.accion (ej: assets.read, employees.create). Acciones válidas: read, create, update, delete, retire, admin'
            }
          })}
          disabled={mode === 'edit' && !isEditing}
          placeholder="ej: employees.read, assets.create, system.admin"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.code && (
          <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('name', { required: 'El nombre es requerido' })}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descripción
        </label>
        <textarea
          {...register('description')}
          disabled={mode === 'edit' && !isEditing}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
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
                {data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

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
            Crear Permiso
          </ActionButton>
        </div>
      )}
    </form>
  );
}
