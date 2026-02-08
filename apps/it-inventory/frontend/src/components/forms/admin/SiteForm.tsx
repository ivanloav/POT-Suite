import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sitesService } from '@/services/sitesAdminService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface SiteFormData {
  code: string;
  name: string;
  isActive: boolean;
}

interface SiteFormProps {
  mode: 'create' | 'edit';
  siteId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function SiteForm({ mode, siteId, onSuccess, onCancel, onHeaderButtons }: SiteFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('users');

  const { data, isLoading } = useQuery({
    queryKey: ['sites-admin', siteId],
    queryFn: () => sitesService.getById(siteId!),
    enabled: mode === 'edit' && !!siteId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && data?.data) {
      reset({
        code: data.data.code,
        name: data.data.name,
        isActive: data.data.isActive,
      });
    }
  }, [data, reset, mode]);

  const createMutation = useMutation({
    mutationFn: sitesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
      toast.success('Site creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el site');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: SiteFormData) => sitesService.update(siteId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites-admin', siteId] });
      queryClient.invalidateQueries({ queryKey: ['sites-admin'] });
      toast.success('Site actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el site');
    },
  });

  const onSubmit = (formData: SiteFormData) => {
    if (mode === 'create') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data?.data) {
      reset({
        code: data.data.code,
        name: data.data.name,
        isActive: data.data.isActive,
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
                form="site-form"
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
      onHeaderButtonsRef.current(headerButtons);
    } else if (mode === 'edit' && onHeaderButtonsRef.current) {
      onHeaderButtonsRef.current(null);
    }
  }, [isEditing, updateMutation.isPending, canEdit, mode]);

  if (mode === 'edit' && isLoading) {
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <form id="site-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          {...register('code', { required: 'El código es requerido' })}
          id="code"
          type="text"
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.code && (
          <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('name', { required: 'El nombre es requerido' })}
          id="name"
          type="text"
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
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
                {data?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {mode === 'edit' && data?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.createdAt ? new Date(data.data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.data.updatedAt ? new Date(data.data.updatedAt).toLocaleString('es-ES') : 'N/A'}
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
            Crear Site
          </ActionButton>
        </div>
      )}
    </form>
  );
}
