import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sectionService } from '@/services/sectionService';
import { sitesService } from '@/services/sitesService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface SectionFormData {
  siteId: number;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface SectionFormProps {
  mode: 'create' | 'edit';
  sectionId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function SectionForm({ mode, sectionId, onSuccess, onCancel, onHeaderButtons }: SectionFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [sortOrderDisabled, setSortOrderDisabled] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs');

  const { data: sectionData, isLoading } = useQuery({
    queryKey: ['sections', sectionId],
    queryFn: () => sectionService.getById(sectionId!),
    enabled: mode === 'edit' && !!sectionId,
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesService.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SectionFormData>({
    defaultValues: {
      siteId: 0,
      name: '',
      sortOrder: 0,
      isActive: true,
    },
  });

  const selectedSiteId = watch('siteId');

  // Obtener el siguiente sortOrder cuando se selecciona un sitio en modo crear
  useEffect(() => {
    if (mode === 'create' && selectedSiteId > 0) {
      sectionService.getNextSortOrder(selectedSiteId).then((nextOrder) => {
        setValue('sortOrder', nextOrder);
        setSortOrderDisabled(false);
      });
    }
  }, [selectedSiteId, mode, setValue]);

  useEffect(() => {
    if (mode === 'edit' && sectionData?.data) {
      const section = sectionData.data;
      reset({
        siteId: section.siteId,
        name: section.name,
        sortOrder: section.sortOrder,
        isActive: section.isActive,
      });
    }
  }, [sectionData, reset, mode]);

  const createMutation = useMutation({
    mutationFn: sectionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Sección creada exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la sección');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Omit<SectionFormData, 'siteId'>) => sectionService.update(sectionId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sections', sectionId] });
      queryClient.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Sección actualizada exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la sección');
    },
  });

  const onSubmit = (data: SectionFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      const { siteId, ...updateData } = data;
      updateMutation.mutate(updateData);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (sectionData?.data) {
      const section = sectionData.data;
      reset({
        siteId: section.siteId,
        name: section.name,
        sortOrder: section.sortOrder,
        isActive: section.isActive,
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
                form="section-form"
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
  }, [isEditing, mode, onHeaderButtons, canEdit, updateMutation.isPending]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form id="section-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Site */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sitio *
        </label>
        <select
          {...register('siteId', { required: 'El sitio es requerido', valueAsNumber: true })}
          disabled={mode === 'edit' || !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          <option value={0}>Seleccione un sitio</option>
          {sitesData?.data?.map((site: any) => (
            <option key={site.siteId} value={site.siteId}>
              {site.name}
            </option>
          ))}
        </select>
        {errors.siteId && (
          <span className="text-sm text-red-600 dark:text-red-400">{errors.siteId.message}</span>
        )}
      </div>

      {/* Name */}
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

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Orden de clasificación
        </label>
        <input
          type="number"
          {...register('sortOrder', { valueAsNumber: true })}
          disabled={mode === 'create' ? sortOrderDisabled : !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
        {mode === 'create' && sortOrderDisabled && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Seleccione un sitio para habilitar este campo
          </p>
        )}
      </div>

      {/* Is Active */}
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
                {sectionData?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {mode === 'edit' && sectionData?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {sectionData.data.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {sectionData.data.createdAt ? new Date(sectionData.data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {sectionData.data.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {sectionData.data.updatedAt ? new Date(sectionData.data.updatedAt).toLocaleString('es-ES') : 'N/A'}
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
            Crear Sección
          </ActionButton>
        </div>
      )}
    </form>
  );
}
