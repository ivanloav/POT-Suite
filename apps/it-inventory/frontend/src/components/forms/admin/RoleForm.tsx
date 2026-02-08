import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import rolesAdminService from '@/services/rolesAdminService';
import permissionsAdminService from '@/services/permissionsAdminService';
import { rolePermissionsService } from '@/services/rolePermissionsService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface RoleFormData {
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface RoleFormProps {
  mode: 'create' | 'edit';
  roleId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function RoleForm({ mode, roleId, onSuccess, onCancel, onHeaderButtons }: RoleFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('users');

  const { data, isLoading } = useQuery({
    queryKey: ['roles-admin', roleId],
    queryFn: () => rolesAdminService.getById(roleId!),
    enabled: mode === 'edit' && !!roleId,
  });

  // Cargar permisos disponibles
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions-admin'],
    queryFn: () => permissionsAdminService.getAll(),
  });

  // Cargar permisos asignados al rol en modo edit
  const { data: rolePermissionsData } = useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => rolePermissionsService.getByRole(roleId!),
    enabled: mode === 'edit' && !!roleId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
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

  // Cargar permisos asignados
  useEffect(() => {
    if (mode === 'edit' && rolePermissionsData?.data) {
      setSelectedPermissions(rolePermissionsData.data.map(rp => rp.permissionId));
    }
  }, [rolePermissionsData, mode]);

  const createMutation = useMutation({
    mutationFn: (formData: RoleFormData) => 
      rolesAdminService.create({
        ...formData,
        permissionIds: selectedPermissions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
      toast.success('Rol creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el rol');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: RoleFormData) => 
      rolesAdminService.update(roleId!, {
        ...formData,
        permissionIds: selectedPermissions,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles-admin', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles-admin'] });
      queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] });
      toast.success('Rol actualizado exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    },
  });

  const onSubmit = (formData: RoleFormData) => {
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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Código <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('code', { required: 'El código es requerido' })}
          disabled={mode === 'edit' && !isEditing}
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

      {/* Sección de Permisos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Permisos Asignados
        </h3>
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {permissionsData?.map((permission: any) => (
            <label 
              key={permission.id} 
              className="flex items-start py-2 px-3 hover:bg-white dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors duration-150 group"
            >
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([...selectedPermissions, permission.id]);
                    } else {
                      setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                    }
                  }}
                  disabled={mode === 'edit' && !isEditing}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed mr-3"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {permission.name}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {permission.code}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

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
            Crear Rol
          </ActionButton>
        </div>
      )}
    </form>
  );
}
