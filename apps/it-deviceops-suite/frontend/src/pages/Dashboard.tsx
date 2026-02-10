import { useQuery } from '@tanstack/react-query';
import { assetsService } from '@/services/assetsService';
import { useAuthStore } from '@/store/authStore';
import { Box, Package, AlertTriangle, Archive } from 'lucide-react';

export default function Dashboard() {
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);

  const { data: assetsData } = useQuery({
    queryKey: ['assets', selectedSiteId],
    queryFn: () => assetsService.getAll({ siteId: selectedSiteId || undefined }),
  });

  const stats = [
    {
      label: 'Total Activos',
      value: assetsData?.pagination?.total || 0,
      icon: Box,
      color: 'bg-blue-500',
    },
    {
      label: 'En Stock',
      value:
        assetsData?.data?.filter((a: any) => a.status?.code === 'in_stock').length || 0,
      icon: Package,
      color: 'bg-green-500',
    },
    {
      label: 'Asignados',
      value:
        assetsData?.data?.filter((a: any) => a.status?.code === 'assigned').length || 0,
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      label: 'Retirados',
      value:
        assetsData?.data?.filter((a: any) => a.status?.code === 'retired').length || 0,
      icon: Archive,
      color: 'bg-red-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Bienvenido al Sistema de Control de Inventario IT
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus activos IT, PDAs nominativas, asignaciones de empleados y mucho
          más desde esta aplicación.
        </p>
      </div>
    </div>
  );
}
