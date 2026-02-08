import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import Login from './pages/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AssetsPage from './pages/AssetsPage';
import EmployeesPage from './pages/EmployeesPage';
import AssignmentsPage from './pages/AssignmentsPage';
import AssetMaintenancePage from './pages/AssetMaintenancePage';
import OSPage from './pages/catalogs/AssetOSVersionsPage';
import OSFamiliesPage from './pages/catalogs/AssetOSFamiliesPage';
import AssetModelsPage from './pages/catalogs/AssetModelsPage';
import AssetBrandsPage from './pages/catalogs/AssetBrandsPage';
import AssetTypesPage from './pages/catalogs/AssetTypesPage';
import AssetStatusesPage from './pages/catalogs/AssetStatusesPage';
import AssetMaintenanceTypesPage from './pages/catalogs/AssetMaintenanceTypesPage';
import HolidaysPage from './pages/catalogs/HolidaysPage';
import SectionsPage from './pages/catalogs/SectionsPage';
import AssetCpuVendorsPage from './pages/catalogs/AssetCpuVendorsPage';
import AssetCpuSegmentsPage from './pages/catalogs/AssetCpuSegmentsPage';
import AssetRamMemoryTypesPage from './pages/catalogs/AssetRamMemoryTypesPage';
import AssetRamFormFactorsPage from './pages/catalogs/AssetRamFormFactorsPage';
import AssetStorageDriveTypesPage from './pages/catalogs/AssetStorageDriveTypesPage';
import AssetStorageInterfacesPage from './pages/catalogs/AssetStorageInterfacesPage';
import AssetStorageFormFactorsPage from './pages/catalogs/AssetStorageFormFactorsPage';
import AssetCPUPage from './pages/catalogs/AssetCPUPage';
import AssetRAMPage from './pages/catalogs/AssetRAMPage';
import AssetStoragePage from './pages/catalogs/AssetStoragePage';
import SitesPage from './pages/admin/SitesPage';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { authService } from './services/authService';
import './index.css';

const decodeJwtExp = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);
  const token = useAuthStore((state) => state.token);
  const updateToken = useAuthStore((state) => state.updateToken);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  // Cerrar sesión después de 1 hora de inactividad
  useInactivityLogout(() => {
    if (isAuthenticated) {
      logout();
      window.location.href = '/login';
    }
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      if (!isAuthenticated && !token && window.location.pathname.includes('/login')) {
        setAuthChecked(true);
        return;
      }

      if (isAuthenticated || token) {
        if (token && !isAuthenticated) {
          updateToken(token);
        }
        setAuthChecked(true);

        // Refrescar en segundo plano solo si el token está por expirar (reduce 401s innecesarios)
        if (token) {
          const expMs = decodeJwtExp(token);
          const fiveMinutesMs = 5 * 60 * 1000;
          if (!expMs || expMs - Date.now() <= fiveMinutesMs) {
            authService.refresh()
              .then((refreshResult) => {
                if (!isMounted) return;
                updateToken(refreshResult.token);
              })
              .catch(() => {
                // Si falla, mantenemos el token actual hasta que expire
              });
          }
        }
        return;
      }

      try {
        const refreshResult = await authService.refresh();
        if (!isMounted) return;
        updateToken(refreshResult.token);
        const profile = await authService.getProfile();
        if (!isMounted) return;
        refreshSession(profile, refreshResult.token);
      } catch (error) {
        if (isMounted) {
          logout();
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
        }
      }
    };

    if (!isAuthChecked) {
      bootstrapAuth();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthChecked, logout, refreshSession, setAuthChecked, token, updateToken]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="assets"
              element={
                <ProtectedRoute permission="assets.read">
                  <AssetsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="employees"
              element={
                <ProtectedRoute permission="employees.read">
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="assignments"
              element={
                <ProtectedRoute permission="assignments.read">
                  <AssignmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="maintenance"
              element={
                <ProtectedRoute permission="assets.read">
                  <AssetMaintenancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/os-versions"
              element={
                <ProtectedRoute permission="osVersions.read">
                  <OSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/os-families"
              element={
                <ProtectedRoute permission="assetOsFamilies.read">
                  <OSFamiliesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-models"
              element={
                <ProtectedRoute permission="assetModels.read">
                  <AssetModelsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-brands"
              element={
                <ProtectedRoute permission="assetBrands.read">
                  <AssetBrandsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-types"
              element={
                <ProtectedRoute permission="assetTypes.read">
                  <AssetTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-statuses"
              element={
                <ProtectedRoute permission="assetTypes.read">
                  <AssetStatusesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/maintenance-types"
              element={
                <ProtectedRoute permission="maintenanceTypes.read">
                  <AssetMaintenanceTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/holidays"
              element={
                <ProtectedRoute permission="holidays.read">
                  <HolidaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/sections"
              element={
                <ProtectedRoute permission="sections.read">
                  <SectionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/cpu-vendors"
              element={
                <ProtectedRoute permission="assetCPU.read">
                  <AssetCpuVendorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/cpu-segments"
              element={
                <ProtectedRoute permission="assetCPU.read">
                  <AssetCpuSegmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/ram-memory-types"
              element={
                <ProtectedRoute permission="assetRAM.read">
                  <AssetRamMemoryTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/ram-form-factors"
              element={
                <ProtectedRoute permission="assetRAM.read">
                  <AssetRamFormFactorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/storage-drive-types"
              element={
                <ProtectedRoute permission="assetStorage.read">
                  <AssetStorageDriveTypesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/storage-interfaces"
              element={
                <ProtectedRoute permission="assetStorage.read">
                  <AssetStorageInterfacesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/storage-form-factors"
              element={
                <ProtectedRoute permission="assetStorage.read">
                  <AssetStorageFormFactorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-cpu"
              element={
                <ProtectedRoute permission="assetCPU.read">
                  <AssetCPUPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-ram"
              element={
                <ProtectedRoute permission="assetRAM.read">
                  <AssetRAMPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="catalogs/asset-storage"
              element={
                <ProtectedRoute permission="assetStorage.read">
                  <AssetStoragePage />
                </ProtectedRoute>
              }
            />
            
            {/* Administración */}
            <Route
              path="admin/sites"
              element={
                <ProtectedRoute permission="system.read">
                  <SitesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute permission="system.read">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/roles"
              element={
                <ProtectedRoute permission="system.read">
                  <RolesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/permissions"
              element={
                <ProtectedRoute permission="system.read">
                  <PermissionsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
