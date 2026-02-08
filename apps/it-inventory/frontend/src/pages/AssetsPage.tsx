import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsService } from '@/services/assetsService';
import { catalogsService } from '@/services/catalogsService';
import { sitesService } from '@/services/sitesService';
import { useAuthStore } from '@/store/authStore';
import { getSiteColor } from '@/utils/uiHelpers';
import { Plus, RefreshCw, Download, Upload, FileText } from 'lucide-react';
import { parseExcelFile, exportAssetsToExcel } from '@/utils/excelHelpers';
import Modal from '@/components/shared/Modal';
import AssetForm from '@/components/forms/AssetForm';
import { DataTable, Column, FilterConfig, DataTableFilters } from '@/components/shared/DataTable';
import DuplicatesModal from '@/components/shared/DuplicatesModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ActionButton } from '@/components/shared/ActionButton';

export default function AssetsPage() {
    const [importing, setImporting] = useState(false);
    const [duplicatesData, setDuplicatesData] = useState<any>(null);
    const [siteConflictData, setSiteConflictData] = useState<any>(null);
    const [pendingImportData, setPendingImportData] = useState<any>(null);

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImporting(true);
      try {
        const json = await parseExcelFile(file);
        
        // Si hay site seleccionado, verificar conflictos
        if (selectedSiteId) {
          const siteCounts: Record<number, number> = {};
          json.forEach((row: any) => {
            const siteId = row.siteId || row['Site ID'];
            if (siteId) {
              siteCounts[siteId] = (siteCounts[siteId] || 0) + 1;
            }
          });
          
          // Si hay activos de otros sites, mostrar modal
          const otherSites = Object.keys(siteCounts).filter(id => Number(id) !== selectedSiteId);
          if (otherSites.length > 0) {
            setSiteConflictData({
              siteCounts,
              selectedSiteId,
              totalAssets: json.length
            });
            setPendingImportData(json);
            setImporting(false);
            e.target.value = '';
            return;
          }
        }
        
        // Enviar al backend
        const result = await assetsService.importFromExcel(json);
        
        // Manejar duplicados
        if (result.duplicados && result.duplicados.length > 0) {
          setDuplicatesData(result.duplicados);
          toast.info(`${result.insertados} activos insertados. ${result.duplicados.length} duplicados detectados.`);
        } else if (result.errores && result.errores.length > 0) {
          toast.warn(`Importados: ${result.insertados}. Errores: ${result.errores.length}`);
          // Mostrar hasta 5 errores específicos
          const maxErrors = Math.min(result.errores.length, 5);
          for (let i = 0; i < maxErrors; i++) {
            const error = result.errores[i];
            toast.error(`Fila ${error.row}: ${error.error}`);
          }
          if (result.errores.length > 5) {
            toast.error(`... y ${result.errores.length - 5} errores más`);
          }
        } else {
          toast.success('Importación exitosa');
        }
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      } catch (err: any) {
        toast.error('Error al importar: ' + (err?.message || 'Error desconocido'));
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };

    const handleUpdateDuplicates = async () => {
      if (!duplicatesData) return;
      try {
        const result = await assetsService.updateDuplicatesFromExcel(duplicatesData);
        toast.success(`${result.actualizados} activos actualizados`);
        setDuplicatesData(null);
        queryClient.invalidateQueries({ queryKey: ['assets'] });
      } catch (err: any) {
        toast.error('Error al actualizar: ' + (err?.message || 'Error desconocido'));
      }
    };

    const handleImportFilteredBySite = async () => {
      if (!pendingImportData || !selectedSiteId) return;
      setImporting(true);
      try {
        const filteredData = pendingImportData.filter((row: any) => {
          const siteId = row.siteId || row['Site ID'];
          return Number(siteId) === selectedSiteId;
        });
        
        const result = await assetsService.importFromExcel(filteredData);
        
        if (result.duplicados && result.duplicados.length > 0) {
          setDuplicatesData(result.duplicados);
          toast.info(`${result.insertados} activos insertados. ${result.duplicados.length} duplicados detectados.`);
        } else if (result.errores && result.errores.length > 0) {
          toast.warn(`Importados: ${result.insertados}. Errores: ${result.errores.length}`);
        } else {
          toast.success(`Importación exitosa: ${result.insertados} activos`);
        }
        
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        setSiteConflictData(null);
        setPendingImportData(null);
      } catch (err: any) {
        toast.error('Error al importar: ' + (err?.message || 'Error desconocido'));
      } finally {
        setImporting(false);
      }
    };

    const handleImportAllSites = async () => {
      if (!pendingImportData) return;
      setImporting(true);
      try {
        const result = await assetsService.importFromExcel(pendingImportData);
        
        if (result.duplicados && result.duplicados.length > 0) {
          setDuplicatesData(result.duplicados);
          toast.info(`${result.insertados} activos insertados. ${result.duplicados.length} duplicados detectados.`);
        } else if (result.errores && result.errores.length > 0) {
          toast.warn(`Importados: ${result.insertados}. Errores: ${result.errores.length}`);
        } else {
          toast.success(`Importación exitosa: ${result.insertados} activos`);
        }
        
        queryClient.invalidateQueries({ queryKey: ['assets'] });
        setSiteConflictData(null);
        setPendingImportData(null);
      } catch (err: any) {
        toast.error('Error al importar: ' + (err?.message || 'Error desconocido'));
      } finally {
        setImporting(false);
      }
    };

    const handleDownloadTemplate = async () => {
      try {
        const blob = await assetsService.downloadTemplate();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets-template-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Plantilla descargada exitosamente');
      } catch (error: any) {
        toast.error(error?.message || 'Error al descargar plantilla');
      }
    };

    const handleExportToExcel = () => {
      if (!assetsData?.data || assetsData.data.length === 0) {
        toast.warn('No hay datos para exportar');
        return;
      }

      try {
        const count = exportAssetsToExcel(assetsData.data);
        toast.success(`Exportados ${count} activos`);
      } catch (error: any) {
        toast.error(error.message || 'Error al exportar');
      }
    };

  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [detailsHeaderActions, setDetailsHeaderActions] = useState<React.ReactNode>(null);
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);
  const canManage = useAuthStore((state) => state.canManage);
  const [filters, setFilters] = useState<{
    siteId?: number;
    status?: string;
    typeId?: number;
    sectionId?: number;
    sectionName?: string;
  }>({});

  // Verificar si el usuario tiene rol IT o Admin
  const canManageResource = canManage('assets');

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', filters, selectedSiteId],
    queryFn: () => {
      const finalSiteId = filters.siteId || selectedSiteId || undefined;
      return assetsService.getAll({ ...filters, siteId: finalSiteId });
    },
  });

  const { data: typesData } = useQuery({
    queryKey: ['asset-types'],
    queryFn: catalogsService.getAssetTypes,
  });

  const { data: selectedSite } = useQuery({
    queryKey: ['site', selectedSiteId],
    queryFn: () => sitesService.getById(selectedSiteId!),
    enabled: !!selectedSiteId,
  });

  const { data: selectedAsset } = useQuery({
    queryKey: ['asset', selectedAssetId],
    queryFn: () => assetsService.getById(selectedAssetId!),
    enabled: !!selectedAssetId,
  });

  const { data: assetSite } = useQuery({
    queryKey: ['site', selectedAsset?.data?.siteId],
    queryFn: () => sitesService.getById(selectedAsset!.data.siteId),
    enabled: !!selectedAsset?.data?.siteId,
  });

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', filters.siteId, selectedSiteId],
    queryFn: () => {
      const finalSiteId = filters.siteId || selectedSiteId || undefined;
      return catalogsService.getSections(finalSiteId);
    },
  });

  const uniqueSections = useMemo(() => {
    if (!sectionsData?.data) return [];
    const finalSiteId = filters.siteId || selectedSiteId;
    if (finalSiteId) return sectionsData.data;
    
    // Si no hay site seleccionado, agrupar por nombre
    const seen = new Map();
    sectionsData.data.forEach((section: any) => {
      if (!seen.has(section.name)) {
        seen.set(section.name, { ...section, isGrouped: true });
      }
    });
    return Array.from(seen.values());
  }, [sectionsData?.data, filters.siteId, selectedSiteId]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['assets'] });
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    // Manejar lógica especial de sectionId vs sectionName
    const finalSiteId = newFilters.siteId || selectedSiteId;
    
    if (newFilters.section) {
      const selectedSection = uniqueSections?.find(
        (s: any) => s.id.toString() === newFilters.section || s.name === newFilters.section
      );
      
      if (finalSiteId) {
        const { section, ...rest } = newFilters;
        setFilters({
          ...rest,
          sectionId: Number(newFilters.section),
          sectionName: undefined,
        });
      } else {
        const { section, ...rest } = newFilters;
        setFilters({
          ...rest,
          sectionId: undefined,
          sectionName: selectedSection?.name,
        });
      }
    } else {
      const { section, ...rest } = newFilters;
      setFilters({
        ...rest,
        sectionId: undefined,
        sectionName: undefined,
      });
    }
  };

  const getStatusBadge = (asset: any) => {
    if (!asset.status) return null;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${asset.status.colorClass || 'bg-gray-100 text-gray-800'}`}>
        {asset.status.name}
      </span>
    );
  };

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (asset) => asset.id || '-',
    },
    {
      key: 'assetTag',
      label: 'Etiqueta',
      width: '12%',
      sortable: true,
      render: (asset) => (
        <button
          onClick={() => setSelectedAssetId(asset.id)}
          className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
        >
          {asset.assetTag}
        </button>
      ),
    },
    {
      key: 'employee',
      label: 'Usuario',
      width: '18%',
      sortable: true,
      render: (asset) => (
        asset.employee ? `${asset.employee.firstName} ${asset.employee.lastName}` : '-'
      ),
    },
    {
      key: 'site',
      label: 'Sede',
      width: '10%',
      sortable: true,
      render: (asset) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${getSiteColor(asset.site?.code || '')}`}>
          {asset.site?.code || '-'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Tipo',
      width: '12%',
      sortable: true,
      render: (asset) => asset.type?.name || '-',
    },
    {
      key: 'os_version',
      label: 'Versión OS',
      width: '15%',
      sortable: true,
      render: (asset) => 
        asset.osVersion?.name || '-',
    },
    {
      key: 'brand',
      label: 'Marca',
      width: '12%',
      sortable: true,
      render: (asset) => {
        if (!asset.model?.brand?.name) return '-';
        const brandName = asset.model.brand.name.charAt(0).toUpperCase() + asset.model.brand.name.slice(1);
        return `${brandName}`;
      },
    },
    {
      key: 'model',
      label: 'Modelo',
      width: '22%',
      sortable: true,
      render: (asset) => {
        if (!asset.model) return '-';
        return `${asset.model.model}`;
      },
    },
    {
      key: 'cpu',
      label: 'CPU',
      width: '25%',
      sortable: true,
      render: (asset) => asset.cpu ? `${asset.cpu.vendor?.name || ''} ${asset.cpu.model}`.trim() : '-',
    },
    {
      key: 'ram',
      label: 'RAM',
      width: '18%',
      sortable: true,
      render: (asset) => {
        if (!asset.ram) return '-';
        const capacity = `${asset.ram.capacityGb}GB`;
        const memType = asset.ram.memType?.name || '';
        const speed = asset.ram.speedMts ? ` ${asset.ram.speedMts}MHz` : '';
        return `${capacity} ${memType}${speed}`.trim();
      },
    },
    {
      key: 'storage',
      label: 'Almacenamiento',
      width: '22%',
      sortable: true,
      render: (asset) => {
        if (!asset.storage) return '-';
        const capacity = `${asset.storage.capacityGb}GB`;
        const driveType = asset.storage.driveType?.name || '';
        const interface_ = asset.storage.interface?.name ? ` ${asset.storage.interface.name}` : '';
        return `${capacity} ${driveType}${interface_}`.trim();
      },
    },
    {
      key: 'serial',
      label: 'Serial',
      width: '15%',
      sortable: true,
      render: (asset) => asset.serial || '-',
    },
    {
      key: 'status',
      label: 'Estado',
      width: '10%',
      sortable: true,
      render: (asset) => getStatusBadge(asset),
    },
    {
      key: 'section',
      label: 'Ubicación',
      width: '15%',
      sortable: true,
      render: (asset) => asset.section?.name || '-',
    },
    {
      key: 'warranty',
      label: 'Garantía',
      width: '15%',
      sortable: true,
      render: (asset) => {
        if (!asset.warrantyEnd) return '-';
        const today = new Date();
        const warrantyEnd = new Date(asset.warrantyEnd);
        const isUnderWarranty = warrantyEnd >= today;
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isUnderWarranty 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {isUnderWarranty ? 'En garantía' : 'Sin garantía'}
          </span>
        );
      },
    },
    {
      key: 'createdBy',
      label: 'Creado por',
      sortable: true,
      render: (asset) => (asset.creator?.userName || '-'),
    },
    {
      key: 'createdAt',
      label: 'Creación',
      sortable: true,
      render: (asset) => (asset.createdAt ? new Date(asset.createdAt).toLocaleString('es-ES') : '-'),
    },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { value: 'in_stock', label: 'En Stock' },
        { value: 'assigned', label: 'Asignado' },
        { value: 'repair', label: 'En Reparación' },
        { value: 'retired', label: 'Retirado' },
      ],
    },
    {
      key: 'typeId',
      label: 'Tipo',
      type: 'select',
      placeholder: 'Todos',
      options: typesData?.data?.map((type: any) => ({
        value: type.id,
        label: type.name,
      })) || [],
    },
    {
      key: 'section',
      label: 'Sección',
      type: 'select',
      placeholder: 'Todas',
      options: uniqueSections?.map((section: any) => ({
        value: section.isGrouped ? section.name : section.id,
        label: section.name,
      })) || [],
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Activos
        </h1>
        <div className="flex items-center gap-3">
          <ActionButton
            variant="refresh"
            icon={RefreshCw}
            onClick={handleRefresh}
            title="Refrescar página"
          >
            Refrescar
          </ActionButton>
          {canManageResource && (
            <>
              <ActionButton
                  variant="template"
                  icon={FileText}
                  onClick={handleDownloadTemplate}
                  title="Descargar plantilla Excel"
              >
                  Plantilla
              </ActionButton>
              <ActionButton
                variant="export"
                icon={Download}
                onClick={handleExportToExcel}
                title="Exportar a Excel"
              >
                Exportar
              </ActionButton>
              <label className="btn btn-secondary flex items-center gap-2 cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800" title="Importar desde Excel">
                <Upload className="h-5 w-5" />
                <span>{importing ? 'Importando...' : 'Importar'}</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  disabled={importing}
                  onChange={handleImportExcel}
                />
              </label>
              {selectedSiteId && (
                <ActionButton
                  variant="create"
                  icon={Plus}
                  onClick={() => setIsCreateModalOpen(true)}
                  title="Crear nuevo activo"
                >
                  Nuevo Activo
                </ActionButton>
              )}
            </>
          )}
        </div>
      </div>


      {/* Toastify container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        aria-label="Notificaciones"
      />

      {/* Filtros */}
      <DataTableFilters
        filters={filterConfigs}
        onFilterChange={handleFilterChange}
      />

      {/* Tabla */}
      <div className="card">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Cargando activos...</p>
          </div>
        ) : (
          <DataTable
            data={assetsData?.data || []}
            columns={columns}
            keyExtractor={(asset) => asset.id}
            emptyMessage="No se encontraron activos"
            defaultPageSize={10}
          />
        )}
      </div>

      {/* Modal para crear activo */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nuevo Activo"
        titleBadge={
          selectedSite?.data && (
            <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-semibold">
              {selectedSite.data.code}
            </span>
          )
        }
        size="xl"
      >
        <AssetForm
          mode="create"
          onSuccess={() => setIsCreateModalOpen(false)}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Modal para ver/editar activo */}
      <Modal
        isOpen={selectedAssetId !== null}
        onClose={() => setSelectedAssetId(null)}
        title={selectedAssetId ? "Detalles del Activo" : ""}
        titleBadge={
          assetSite?.data && (
            <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg">
              {assetSite.data.code}
            </span>
          )
        }
        size="xl"
        headerActions={detailsHeaderActions}
      >
        {selectedAssetId && (
          <AssetForm
            mode="edit"
            assetId={selectedAssetId}
            onSuccess={() => setSelectedAssetId(null)}
            onCancel={() => setSelectedAssetId(null)}
            onHeaderButtons={setDetailsHeaderActions}
          />
        )}
      </Modal>

      {/* Modal para duplicados */}
      <DuplicatesModal
        isOpen={!!duplicatesData && duplicatesData.length > 0}
        onClose={() => setDuplicatesData(null)}
        onConfirm={handleUpdateDuplicates}
        duplicates={duplicatesData || []}
        columns={[
          { key: 'row', label: 'Fila' },
          { key: 'assetTag', label: 'Etiqueta' },
        ]}
        title="Activos Duplicados Detectados"
        message="Se detectaron activos que ya existen en el sistema. ¿Deseas actualizarlos con los datos del archivo?"
      />

      {/* Modal para conflicto de sites */}
      {siteConflictData && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSiteConflictData(null);
            setPendingImportData(null);
          }}
          title="Conflicto de Sites Detectado"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              El archivo contiene activos de múltiples sites. Actualmente tienes seleccionado el site <strong>{selectedSite?.data?.code}</strong>.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Distribución de activos:</h4>
              <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
                {Object.entries(siteConflictData.siteCounts).map(([siteId, count]) => (
                  <li key={siteId}>
                    Site ID {siteId}: <strong>{String(count)}</strong> activo{Number(count) !== 1 ? 's' : ''}
                    {Number(siteId) === selectedSiteId && ' (seleccionado)'}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm font-semibold text-blue-900 dark:text-blue-300">
                Total: {siteConflictData.totalAssets} activos
              </p>
            </div>

            <p className="text-gray-700 dark:text-gray-300">
              ¿Qué deseas hacer?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleImportFilteredBySite}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Importar solo los del site seleccionado ({selectedSiteId ? (siteConflictData.siteCounts[selectedSiteId] || 0) : 0} activos)
              </button>
              
              <button
                onClick={handleImportAllSites}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Importar todos los activos ({siteConflictData.totalAssets})
              </button>
              
              <button
                onClick={() => {
                  setSiteConflictData(null);
                  setPendingImportData(null);
                  toast.info('Importación cancelada');
                }}
                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancelar importación
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
