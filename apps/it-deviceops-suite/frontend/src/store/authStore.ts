import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Site {
  siteId: number;
  code: string;
  name: string;
}

interface User {
  id: number;
  userName?: string;
  email: string;
  roles: string[];
  permissions: string[];
  sites: Site[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  selectedSiteId: number | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canManage: (resource: string) => boolean;
  setSelectedSite: (siteId: number | null) => void;
  updateToken: (token: string) => void;
  refreshSession: (user: User, token: string) => void;
  setAuthChecked: (checked: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAuthChecked: false,
      selectedSiteId: null,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      updateToken: (token) => {
        set({ token, isAuthenticated: true });
      },

      refreshSession: (user, token) => {
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, selectedSiteId: null });
        // Eliminar después del set() para que persist no lo vuelva a crear
        setTimeout(() => sessionStorage.removeItem('auth-storage'), 0);
      },

      hasPermission: (permission) => {
        const { user } = get();
        return user?.permissions?.includes(permission) || false;
      },

      canManage: (resource) => {
        const { user } = get();
        if (!user?.permissions) return false;
        
        // Verificar si tiene cualquiera de los permisos de gestión para ese recurso
        const managePermissions = [
          `${resource}.create`,
          `${resource}.update`,
          `${resource}.delete`,
          `${resource}.manage`,
          'system.admin',
        ];
        
        return managePermissions.some(perm => user.permissions.includes(perm));
      },

      setSelectedSite: (siteId) => {
        set({ selectedSiteId: siteId });
      },

      setAuthChecked: (checked) => {
        set({ isAuthChecked: checked });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage), // Usar sessionStorage en lugar de localStorage
      partialize: (state) => ({ 
        user: state.user, 
        selectedSiteId: state.selectedSiteId,
        token: state.token,
      }), // Solo persistir user y selectedSiteId
    }
  )
);
