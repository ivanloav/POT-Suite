import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { holidaysService } from '@/services/holidaysService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface HolidayFormData {
  date: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface HolidayFormProps {
  mode: 'create' | 'edit';
  holidayId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function HolidayForm({
  mode,
  holidayId,
  onSuccess,
  onCancel,
  onHeaderButtons,
}: HolidayFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs');

  const { data: holidayData, isLoading } = useQuery({
    queryKey: ['holidays', holidayId],
    queryFn: () => holidaysService.getById(holidayId!),
    enabled: mode === 'edit' && !!holidayId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HolidayFormData>({
    defaultValues: {
      date: '',
      name: '',
      description: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && holidayData?.data) {
      const holiday = holidayData.data;
      reset({
        date: holiday.date,
        name: holiday.name,
        description: holiday.description || '',
        isActive: holiday.isActive,
      });
    }
  }, [holidayData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: holidaysService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Festivo creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el festivo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: HolidayFormData) => holidaysService.update(holidayId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', holidayId] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast.success('Festivo actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el festivo');
    },
  });

  const onSubmit = (data: HolidayFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (holidayData?.data) {
      const holiday = holidayData.data;
      reset({
        date: holiday.date,
        name: holiday.name,
        description: holiday.description || '',
        isActive: holiday.isActive,
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
                form="holiday-form"
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
    <form id="holiday-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Fecha *
        </label>
        <input
          type="date"
          {...register('date', { required: 'La fecha es requerida' })}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
        {errors.date && (
          <span className="text-sm text-red-600 dark:text-red-400">{errors.date.message}</span>
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
          placeholder="Navidad"
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
          placeholder="Descripcion del festivo"
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
                {holidayData?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {mode === 'edit' && holidayData?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Informacion del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {holidayData.data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {holidayData.data.createdAt
                  ? new Date(holidayData.data.createdAt).toLocaleString('es-ES')
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {holidayData.data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {holidayData.data.updatedAt
                  ? new Date(holidayData.data.updatedAt).toLocaleString('es-ES')
                  : 'N/A'}
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
            Crear festivo
          </ActionButton>
        </div>
      )}
    </form>
  );
}
