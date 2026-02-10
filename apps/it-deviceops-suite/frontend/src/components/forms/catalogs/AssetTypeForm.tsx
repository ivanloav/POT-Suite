import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetTypeService } from '@/services/assetTypeService';
import { AssetOsFamiliesService } from '@/services/assetOsFamiliesService';
import { typeOsCompatibilityService } from '@/services/typeOsCompatibilityService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetTypeFormData {
  name: string;
  sortOrder: number;
  isAssignable: boolean;
  supportsOs: boolean;
  isActive: boolean;
}

interface AssetTypeFormProps {
  mode: 'create' | 'edit';
  typeId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetTypeForm({ mode, typeId, onSuccess, onCancel, onHeaderButtons }: AssetTypeFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [selectedOsFamilies, setSelectedOsFamilies] = useState<number[]>([]);
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs');

  const { data: typeData, isLoading } = useQuery({
    queryKey: ['asset-types', typeId],
    queryFn: () => assetTypeService.getById(typeId!),
    enabled: mode === 'edit' && !!typeId,
  });

  // Cargar opciones de OS Families disponibles
  const { data: osFamiliesData } = useQuery({
    queryKey: ['asset-os-families'],
    queryFn: () => AssetOsFamiliesService.getAll(),
  });

  // Cargar compatibilidades actuales en modo edit
  const { data: osCompatData } = useQuery({
    queryKey: ['type-os-compat', typeId],
    queryFn: () => typeOsCompatibilityService.getByType(typeId!),
    enabled: mode === 'edit' && !!typeId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetTypeFormData>({
    defaultValues: {
      name: '',
      sortOrder: 0,
      isAssignable: false,
      supportsOs: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && typeData?.data) {
      const type = typeData.data;
      reset({
        name: type.name,
        sortOrder: type.sortOrder,
        isAssignable: type.isAssignable,
        supportsOs: type.supportsOs,
        isActive: type.isActive,
      });
    }
  }, [typeData, reset, mode]);

  // Cargar compatibilidades de OS seleccionadas
  useEffect(() => {
    if (mode === 'edit' && osCompatData?.data) {
      setSelectedOsFamilies(osCompatData.data.map(c => c.osFamilyId));
    }
  }, [osCompatData, mode]);

  // Cargar compatibilidades de OS seleccionadas
  useEffect(() => {
    if (mode === 'edit' && osCompatData?.data) {
      setSelectedOsFamilies(osCompatData.data.map(c => c.osFamilyId));
    }
  }, [osCompatData, mode]);

  const createMutation = useMutation({
    mutationFn: assetTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      toast.success('Tipo de activo creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el tipo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AssetTypeFormData) => {
      // Actualizar tipo
      const result = await assetTypeService.update(typeId!, data);
      
      // Actualizar compatibilidades de OS
      if (typeId) {
        const currentOsIds = osCompatData?.data?.map(c => c.osFamilyId) || [];
        const toAdd = selectedOsFamilies.filter(id => !currentOsIds.includes(id));
        const toRemove = currentOsIds.filter(id => !selectedOsFamilies.includes(id));
        
        for (const osFamilyId of toAdd) {
          await typeOsCompatibilityService.create({ typeId, osFamilyId });
        }
        for (const osFamilyId of toRemove) {
          await typeOsCompatibilityService.delete({ typeId, osFamilyId });
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-types', typeId] });
      queryClient.invalidateQueries({ queryKey: ['asset-types'] });
      queryClient.invalidateQueries({ queryKey: ['type-os-compat', typeId] });
      toast.success('Tipo de activo actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el tipo');
    },
  });

  const onSubmit = (data: AssetTypeFormData) => {
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
        name: type.name,
        sortOrder: type.sortOrder,
        isAssignable: type.isAssignable,
        supportsOs: type.supportsOs,
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
                form="assettype-form"
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
    <form id="assettype-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
        />
      </div>

      {/* Is Assignable */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Asignable a empleados
        </label>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('isAssignable')}
              disabled={!isEditing}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {typeData?.data?.isAssignable ? 'Sí' : 'No'}
            </span>
          </label>
        </div>
      </div>

      {/* Supports OS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Soporta sistema operativo
        </label>
        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register('supportsOs')}
              disabled={!isEditing}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              {typeData?.data?.supportsOs ? 'Sí' : 'No'}
            </span>
          </label>
        </div>
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
                {typeData?.data?.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </label>
          </div>
        </div>
      )}

      {/* Sección de Compatibilidades de OS */}
      {mode === 'edit' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Compatibilidades
          </h3>
          
          {/* OS Families */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Familias de S.O. Compatibles
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {osFamiliesData?.data?.map((osFamily: any) => (
                <label key={osFamily.id} className="flex items-center py-1.5 hover:bg-white dark:hover:bg-gray-800 px-2 rounded-lg cursor-pointer transition-colors duration-150 group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedOsFamilies.includes(osFamily.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOsFamilies([...selectedOsFamilies, osFamily.id]);
                        } else {
                          setSelectedOsFamilies(selectedOsFamilies.filter(id => id !== osFamily.id));
                        }
                      }}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed mr-2.5"></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{osFamily.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'edit' && typeData?.data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
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
            Crear Tipo
          </ActionButton>
        </div>
      )}
    </form>
  );
}
