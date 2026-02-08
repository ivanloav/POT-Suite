import { useEffect, useState, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import usersAdminService from '@/services/usersAdminService';
import rolesAdminService from '@/services/rolesAdminService';
import { sitesService } from '@/services/sitesService';
import { authService } from '@/services/authService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface UserFormData {
  userName: string;
  email: string;
  password?: string;
  language: string;
  isActive: boolean;
}

interface UserFormProps {
  mode: 'create' | 'edit';
  userId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function UserForm({ mode, userId, onSuccess, onCancel, onHeaderButtons }: UserFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [password, setPassword] = useState('');
  const [selectedSites, setSelectedSites] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const currentUser = useAuthStore((state) => state.user);
  const canManage = useAuthStore((state) => state.canManage);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const canEdit = canManage('users');
  const hasInitialized = useRef(false);
  const onHeaderButtonsRef = useRef(onHeaderButtons);
  
  // Mantener ref actualizada sin causar re-renders
  useEffect(() => {
    onHeaderButtonsRef.current = onHeaderButtons;
  }, [onHeaderButtons]);

  // Validaciones de contraseña
  const passwordValidations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['users-admin', userId],
    queryFn: () => usersAdminService.getById(userId!),
    enabled: mode === 'edit' && !!userId,
  });

  const { data: sitesData } = useQuery({
    queryKey: ['sites'],
    queryFn: sitesService.getAll,
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles-admin'],
    queryFn: rolesAdminService.getAll,
  });

  // Filtrar sites según los permisos del usuario actual
  const availableSites = useMemo(() => {
    if (!sitesData?.data) return [];
    // Si tiene permiso system.admin, puede asignar cualquier site a otros usuarios
    if (currentUser?.permissions?.includes('system.admin')) {
      return sitesData.data;
    }
    // Si no, solo puede asignar los sites que tenga asignados
    if (!currentUser?.sites) return [];
    const userSiteIds = currentUser.sites.map(s => s.siteId);
    return sitesData.data.filter((site: any) => userSiteIds.includes(site.siteId));
  }, [sitesData, currentUser]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      language: 'es',
      isActive: true,
    },
  });

  const watchPassword = watch('password', '');

  useEffect(() => {
    setPassword(watchPassword || '');
  }, [watchPassword]);

  // Inicializar datos cuando cambie el userId
  useEffect(() => {
    if (mode === 'create') return;
    if (!userId) return;
    
    // Resetear flag cuando cambia el usuario
    hasInitialized.current = false;
  }, [mode, userId]);

  // Inicializar datos cuando data esté disponible
  useEffect(() => {
    if (mode === 'create') return;
    if (!data || !userId || hasInitialized.current) return;
    
    reset({
      userName: data.userName,
      email: data.email,
      language: data.language || 'es',
      isActive: data.isActive,
    });
    
    // Extraer IDs y convertir a números
    const siteIds = data.userSites?.map((us: any) => Number(us.siteId)) || [];
    const roleIds = data.userSiteRoles?.map((usr: any) => Number(usr.role?.id || usr.roleId)).filter(id => !isNaN(id)) || [];
    const uniqueRoleIds = [...new Set(roleIds)];
    
    setSelectedSites(siteIds);
    setSelectedRoles(uniqueRoleIds);
    hasInitialized.current = true;
  }, [userId, data, mode, reset]); // Agregar data como dependencia

  const createMutation = useMutation({
    mutationFn: usersAdminService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
      toast.success('Usuario creado exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear el usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: UserFormData) => {
      const updateData: any = {
        userName: formData.userName,
        email: formData.email,
        language: formData.language,
        isActive: formData.isActive,
        siteIds: selectedSites,
        roleIds: selectedRoles,
      };
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }
      return usersAdminService.update(userId!, updateData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin', userId] });
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
      toast.success('Usuario actualizado exitosamente');
      
      // Si el usuario editado es el usuario actual, refrescar sesión automáticamente
      if (userId === currentUser?.id) {
        try {
          const result = await authService.refreshSession();
          refreshSession(result.user, result.token);
          toast.success('Sesión actualizada');
        } catch (error) {
          console.error('Error al refrescar sesión:', error);
        }
      }
      
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el usuario');
    },
  });

  const onSubmit = (formData: UserFormData) => {
    if (mode === 'create') {
      if (!formData.password || formData.password.trim() === '') {
        toast.error('La contraseña es requerida');
        return;
      }
      // Validar requisitos de contraseña
      if (!passwordValidations.minLength || !passwordValidations.hasUpperCase || 
          !passwordValidations.hasLowerCase || !passwordValidations.hasNumber || 
          !passwordValidations.hasSpecialChar) {
        toast.error('La contraseña no cumple con todos los requisitos');
        return;
      }
      createMutation.mutate({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        language: formData.language,
        isActive: formData.isActive,
        siteIds: selectedSites,
        roleIds: selectedRoles,
      });
    } else {
      const updateData: any = {
        userName: formData.userName,
        email: formData.email,
        language: formData.language,
        isActive: formData.isActive,
        siteIds: selectedSites,
        roleIds: selectedRoles,
      };
      if (formData.password && formData.password.trim() !== '') {
        // Validar requisitos si se proporciona nueva contraseña
        if (!passwordValidations.minLength || !passwordValidations.hasUpperCase || 
            !passwordValidations.hasLowerCase || !passwordValidations.hasNumber || 
            !passwordValidations.hasSpecialChar) {
          toast.error('La nueva contraseña no cumple con todos los requisitos');
          return;
        }
        updateData.password = formData.password;
      }
      updateMutation.mutate(updateData);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (data) {
      reset({
        userName: data.userName,
        email: data.email,
        language: data.language || 'es',
        isActive: data.isActive,
      });
      const siteIds = data.userSites?.map((us: any) => us.siteId) || [];
      setSelectedSites(siteIds);
      const roleIds = data.userSiteRoles?.map((usr: any) => usr.role?.id).filter((id): id is number => typeof id === 'number') || [];
      setSelectedRoles([...new Set(roleIds)]);
    }
  };

  useEffect(() => {
    if (mode === 'edit' && onHeaderButtons) {
      if (isEditing) {
        onHeaderButtons(
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
          onHeaderButtons(
            <ActionButton variant="edit" icon={Edit2} onClick={handleEdit}>
              Editar
            </ActionButton>
          );
        } else {
          onHeaderButtonsRef.current?.(null);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre de Usuario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre de usuario <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('userName', { required: 'El nombre de usuario es requerido' })}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.userName && (
          <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Correo electrónico <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          {...register('email', { 
            required: 'El email es requerido',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email inválido'
            }
          })}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Contraseña con validaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Contraseña {mode === 'create' && <span className="text-red-500">*</span>}
          {mode === 'edit' && <span className="text-gray-500 text-xs">(dejar en blanco para no cambiar)</span>}
        </label>
        <input
          type="password"
          {...register('password')}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
          placeholder={mode === 'edit' ? 'Dejar vacío para no cambiar' : ''}
        />
        
        {/* Requisitos de contraseña - solo mostrar si hay contraseña escrita */}
        {password && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requisitos de la contraseña:
            </p>
            <div className="space-y-1">
              <div className={`flex items-center text-sm ${passwordValidations.minLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-2">{passwordValidations.minLength ? '✓' : '✕'}</span>
                Al menos 8 caracteres
              </div>
              <div className={`flex items-center text-sm ${passwordValidations.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-2">{passwordValidations.hasUpperCase ? '✓' : '✕'}</span>
                Al menos una mayúscula
              </div>
              <div className={`flex items-center text-sm ${passwordValidations.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-2">{passwordValidations.hasLowerCase ? '✓' : '✕'}</span>
                Al menos una minúscula
              </div>
              <div className={`flex items-center text-sm ${passwordValidations.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-2">{passwordValidations.hasNumber ? '✓' : '✕'}</span>
                Al menos un número
              </div>
              <div className={`flex items-center text-sm ${passwordValidations.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="mr-2">{passwordValidations.hasSpecialChar ? '✓' : '✕'}</span>
                Al menos un carácter especial
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Idioma */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Idioma
        </label>
        <select
          {...register('language')}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        >
          <option value="">Selecciona idioma...</option>
          {languages.map(lang => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      {/* Estado Activo - Toggle como en otros formularios */}
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

      {/* Sitios asignados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Sitios asignados
        </label>
        <select
          multiple
          size={5}
          value={selectedSites.map(String)}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions);
            setSelectedSites(options.map(opt => parseInt(opt.value)));
          }}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed [&>option:checked]:bg-blue-600 [&>option:checked]:text-white [&>option]:py-1"
          style={{
            backgroundImage: 'none',
          }}
        >
          {availableSites?.map((site: any) => (
            <option key={site.siteId} value={site.siteId}>
              {site.code} - {site.name}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {selectedSites.length} elemento{selectedSites.length !== 1 ? 's' : ''} seleccionado{selectedSites.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Mantén Ctrl + clic para seleccionar múltiples
          </p>
        </div>
      </div>

      {/* Roles asignados */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Roles
        </label>
        <select
          multiple
          size={4}
          value={selectedRoles.map(String)}
          onChange={(e) => {
            const options = Array.from(e.target.selectedOptions);
            const newRoles = options.map(opt => parseInt(opt.value));
            setSelectedRoles(newRoles);
          }}
          disabled={mode === 'edit' && !isEditing}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed [&>option:checked]:bg-blue-600 [&>option:checked]:text-white [&>option]:py-1"
          style={{
            backgroundImage: 'none',
          }}
        >
          {rolesData?.map((role: any) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {selectedRoles.length} elemento{selectedRoles.length !== 1 ? 's' : ''} seleccionado{selectedRoles.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Mantén Ctrl + clic para seleccionar múltiples
          </p>
        </div>
      </div>

      {/* Información del Sistema (solo en modo edit) */}
      {mode === 'edit' && data && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Fecha de Creación:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.createdAt ? new Date(data.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Última Actualización:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {data.updatedAt ? new Date(data.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones de acción en modo create */}
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
            Crear Usuario
          </ActionButton>
        </div>
      )}
    </form>
  );
}
