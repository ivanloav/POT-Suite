import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsService } from '@/services/assetsService';
import { catalogsService } from '@/services/catalogsService';
import { AssetOsVersionsService } from '@/services/assetOsVersionsService';
import { employeesService } from '@/services/employeesService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../shared/ActionButton';

interface AssetFormData {
  assetTag: string;
  typeId: number;
  employeeId?: number;
  sectionId?: number;
  modelId?: number;
  osVersionId?: number;
  cpuId?: number;
  ramId?: number;
  storageId?: number;
  serial?: string;
  imei?: string;
  macAddress?: string;
  ipAddress?: string;
  uuid?: string;
  statusId?: number;
  purchaseDate?: string;
  warrantyEnd?: string;
  location?: string;
  notes?: string;
}

interface AssetFormProps {
  mode: 'create' | 'edit';
  assetId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetForm({ mode, assetId, onSuccess, onCancel, onHeaderButtons }: AssetFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('assets');
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);

  const { data: assetData, isLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => assetsService.getById(assetId!),
    enabled: mode === 'edit' && !!assetId,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssetFormData>();

  const watchedTypeId = watch('typeId');
  const watchedAssetTag = watch('assetTag');
  const watchedModelId = watch('modelId');
  const assetTypeId = assetData?.data?.typeId;
  const prevTypeIdRef = useRef<number | undefined>();
  
  // Resetear modelId solo cuando el usuario cambie manualmente el tipo
  useEffect(() => {
    if (mode === 'create' && watchedTypeId) {
      setValue('modelId', undefined);
    } else if (mode === 'edit' && isEditing && watchedTypeId && prevTypeIdRef.current !== undefined && watchedTypeId !== prevTypeIdRef.current) {
      setValue('modelId', undefined);
    }
    prevTypeIdRef.current = watchedTypeId;
  }, [watchedTypeId, mode, isEditing, setValue]);
  
  // Habilitar detalles solo si hay assetTag y tipo seleccionado (modo crear)
  const modelEnabled = mode === 'edit' || !!(watchedAssetTag && watchedTypeId);
  const detailsEnabled = mode === 'edit' || !!(modelEnabled && watchedModelId);
  
  // Usar watchedTypeId primero, luego assetTypeId para edición
  const effectiveTypeId = watchedTypeId || assetTypeId;

  // Queries para catálogos
  const { data: typesData } = useQuery({
    queryKey: ['asset-types'],
    queryFn: catalogsService.getAssetTypes,
  });

  const assetSiteId = mode === 'edit' ? assetData?.data?.siteId : selectedSiteId;

  const { data: sectionsData } = useQuery({
    queryKey: ['sections', assetSiteId],
    queryFn: () => catalogsService.getSections(assetSiteId || undefined),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees', assetSiteId],
    queryFn: () => employeesService.getAll({ isActive: true, siteId: assetSiteId || undefined }),
    enabled: !!assetSiteId,
  });

  const { data: modelsData } = useQuery({
    queryKey: ['asset-models', effectiveTypeId],
    queryFn: () => catalogsService.getAssetModels(effectiveTypeId ? Number(effectiveTypeId) : undefined),
    enabled: mode === 'create' ? !!effectiveTypeId : true, // En edit mode, cargar siempre
  });

  const selectedModel = modelsData?.data?.find(
    (m: any) => String(m.id) === String(watchedModelId)
  );
  const selectedBrandId = selectedModel?.brand?.id;

  const { data: osVersionsData } = useQuery({
    queryKey: ['asset-os', selectedBrandId, effectiveTypeId],
    queryFn: () => AssetOsVersionsService.getOsVersions(undefined, mode === 'create' ? selectedBrandId : undefined, mode === 'create' && effectiveTypeId ? Number(effectiveTypeId) : undefined),
  });

  const { data: cpusData } = useQuery({
    queryKey: ['asset-cpu', selectedBrandId],
    queryFn: () => catalogsService.getCpus(mode === 'create' ? selectedBrandId : undefined),
  });

  const { data: ramOptionsData } = useQuery({
    queryKey: ['ram-options', selectedBrandId],
    queryFn: () => catalogsService.getRamOptions(mode === 'create' ? selectedBrandId : undefined),
  });

  const { data: storageOptionsData } = useQuery({
    queryKey: ['storage-options'],
    queryFn: catalogsService.getStorageOptions,
  });

  const { data: statusesData } = useQuery({
    queryKey: ['asset-statuses'],
    queryFn: catalogsService.getAssetStatuses,
  });

  // Cargar datos del activo en edición (solo cuando todos los catálogos estén cargados)
  useEffect(() => {
    if (mode === 'edit' && assetData?.data && modelsData && osVersionsData && cpusData && ramOptionsData && storageOptionsData) {
      const asset = assetData.data;
      reset({
        assetTag: asset.assetTag,
        typeId: Number(asset.typeId),
        employeeId: asset.employeeId ? Number(asset.employeeId) : undefined,
        sectionId: asset.sectionId ? Number(asset.sectionId) : undefined,
        modelId: asset.modelId ? Number(asset.modelId) : undefined,
        osVersionId: asset.osVersionId ? Number(asset.osVersionId) : undefined,
        cpuId: asset.cpuId ? Number(asset.cpuId) : undefined,
        ramId: asset.ramId ? Number(asset.ramId) : undefined,
        storageId: asset.storageId ? Number(asset.storageId) : undefined,
        serial: asset.serial || '',
        imei: asset.imei || '',
        macAddress: asset.macAddress || '',
        ipAddress: asset.ipAddress || '',
        uuid: asset.uuid || '',
        statusId: asset.statusId ? Number(asset.statusId) : undefined,
        purchaseDate: asset.purchaseDate || '',
        warrantyEnd: asset.warrantyEnd || '',
        location: asset.location || '',
        notes: asset.notes || '',
      });
    }
  }, [assetData, mode, reset, modelsData, osVersionsData, cpusData, ramOptionsData, storageOptionsData]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: assetsService.create,
    onSuccess: () => {
      toast.success('Activo creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear activo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AssetFormData) => assetsService.update(assetId!, data),
    onSuccess: () => {
      toast.success('Activo actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar activo');
    },
  });

  const normalizeString = (val: string | undefined) => (val === '' ? undefined : val);
  const normalizeNumber = (val: number | string | undefined) => {
    if (!val || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num === 0 ? undefined : num;
  };

  const onSubmit = (data: AssetFormData) => {
    if (mode === 'create') {
      if (!selectedSiteId) {
        toast.error('Debe seleccionar un site antes de crear un activo');
        return;
      }
      
      const createPayload = {
        siteId: selectedSiteId,
        assetTag: data.assetTag,
        typeId: Number(data.typeId),
        employeeId: normalizeNumber(data.employeeId),
        sectionId: normalizeNumber(data.sectionId),
        modelId: normalizeNumber(data.modelId),
        osVersionId: normalizeNumber(data.osVersionId),
        cpuId: normalizeNumber(data.cpuId),
        ramId: normalizeNumber(data.ramId),
        storageId: normalizeNumber(data.storageId),
        serial: normalizeString(data.serial),
        imei: normalizeString(data.imei),
        macAddress: normalizeString(data.macAddress),
        ipAddress: normalizeString(data.ipAddress),
        uuid: normalizeString(data.uuid),
        statusId: normalizeNumber(data.statusId),
        purchaseDate: normalizeString(data.purchaseDate),
        warrantyEnd: normalizeString(data.warrantyEnd),
        location: normalizeString(data.location),
        notes: normalizeString(data.notes),
      };
      createMutation.mutate(createPayload);
    } else {
      const updatePayload = {
        assetTag: data.assetTag,
        typeId: Number(data.typeId),
        employeeId: normalizeNumber(data.employeeId),
        sectionId: normalizeNumber(data.sectionId),
        modelId: normalizeNumber(data.modelId),
        osVersionId: normalizeNumber(data.osVersionId),
        cpuId: normalizeNumber(data.cpuId),
        ramId: normalizeNumber(data.ramId),
        storageId: normalizeNumber(data.storageId),
        serial: normalizeString(data.serial),
        imei: normalizeString(data.imei),
        macAddress: normalizeString(data.macAddress),
        ipAddress: normalizeString(data.ipAddress),
        uuid: normalizeString(data.uuid),
        statusId: normalizeNumber(data.statusId),
        purchaseDate: normalizeString(data.purchaseDate),
        warrantyEnd: normalizeString(data.warrantyEnd),
        location: normalizeString(data.location),
        notes: normalizeString(data.notes),
      };
      updateMutation.mutate(updatePayload);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (assetData?.data) {
      const asset = assetData.data;
      reset({
        assetTag: asset.assetTag,
        typeId: Number(asset.typeId),
        employeeId: asset.employeeId ? Number(asset.employeeId) : undefined,
        sectionId: asset.sectionId ? Number(asset.sectionId) : undefined,
        modelId: asset.modelId ? Number(asset.modelId) : undefined,
        osVersionId: asset.osVersionId ? Number(asset.osVersionId) : undefined,
        cpuId: asset.cpuId ? Number(asset.cpuId) : undefined,
        ramId: asset.ramId ? Number(asset.ramId) : undefined,
        storageId: asset.storageId ? Number(asset.storageId) : undefined,
        serial: asset.serial || '',
        imei: asset.imei || '',
        macAddress: asset.macAddress || '',
        ipAddress: asset.ipAddress || '',
        uuid: asset.uuid || '',
        statusId: asset.statusId ? Number(asset.statusId) : undefined,
        purchaseDate: asset.purchaseDate || '',
        warrantyEnd: asset.warrantyEnd || '',
        location: asset.location || '',
        notes: asset.notes || '',
      });
    }
  };

  // Header buttons para modo edición
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
                form="asset-form"
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
  }, [isEditing, updateMutation.isPending, canEdit, onHeaderButtons, mode]);

  if (mode === 'edit' && isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const asset = mode === 'edit' ? assetData?.data : null;
  const isDisabled = mode === 'edit' && !isEditing;
  const selectedType = typesData?.data?.find((t: any) => String(t.id) === String(effectiveTypeId));

  return (
    <form id="asset-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información Básica
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Etiqueta <span className="text-red-500">*</span>
            </label>
            <input
              {...register('assetTag', { required: 'Etiqueta es requerida' })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ej: PDA-001"
            />
            {errors.assetTag && (
              <p className="text-red-500 text-sm mt-1">{errors.assetTag.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('typeId', { required: 'Tipo es requerido' })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar tipo</option>
              {typesData?.data?.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.typeId && (
              <p className="text-red-500 text-sm mt-1">{errors.typeId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario a asignar</label>
            <select 
              {...register('employeeId')}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin asignar</option>
              {employeesData?.data?.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} {employee.secondLastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sección</label>
            <select
              {...register('sectionId')}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin sección</option>
              {sectionsData?.data?.map((section: any) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select
              {...register('statusId')}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar estado</option>
              {statusesData?.data?.map((status: any) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detalles del Equipo */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Detalles del Equipo
          {mode === 'create' && !modelEnabled && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Complete Etiqueta y Tipo primero)
            </span>
          )}
        </h3>
        
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${mode === 'create' && !modelEnabled ? 'opacity-50' : ''}`}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
            <select
              {...register('modelId')}
              disabled={isDisabled || (mode === 'create' && !modelEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin modelo</option>
              {modelsData?.data?.map((model: any) => (
                <option key={model.id} value={model.id}>
                  {model.brand?.name || model.brand} {model.model}
                </option>
              ))}
            </select>
          </div>

          {selectedType?.supportsOs && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sistema Operativo
              </label>
              <select
                {...register('osVersionId')}
                disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Sin SO</option>
                {osVersionsData?.data?.map((osv: any) => (
                  <option key={osv.id} value={osv.id}>
                    {osv.osFamily?.name} - {osv.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CPU</label>
            <select
              {...register('cpuId')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin CPU</option>
              {cpusData?.data?.map((cpu: any) => (
                <option key={cpu.id} value={cpu.id}>
                  {cpu.vendor?.name || ''} {cpu.model}
                  {cpu.cores && ` (${cpu.cores}C/${cpu.threads}T)`}
                  {cpu.baseGhz && ` @ ${cpu.baseGhz}GHz`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RAM</label>
            <select
              {...register('ramId')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin RAM</option>
              {ramOptionsData?.data?.map((ram: any) => (
                <option key={ram.id} value={ram.id}>
                  {ram.capacityGb}GB {ram.memType?.name || ''}
                  {ram.speedMts && ` @ ${ram.speedMts} MT/s`}
                  {ram.formFactor?.name && ` (${ram.formFactor.name})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Almacenamiento</label>
            <select
              {...register('storageId')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Sin almacenamiento</option>
              {storageOptionsData?.data?.map((storage: any) => (
                <option key={storage.id} value={storage.id}>
                  {storage.capacityGb}GB {storage.driveType?.name || ''}
                  {storage.interface?.name && ` ${storage.interface.name}`}
                  {storage.formFactor?.name && ` (${storage.formFactor.name})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial</label>
            <input
              {...register('serial')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Número de serie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IMEI</label>
            <input
              {...register('imei')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="IMEI (para móviles)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MAC Address</label>
            <input
              {...register('macAddress')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="XX:XX:XX:XX:XX:XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IP Address</label>
            <input
              {...register('ipAddress')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="192.168.1.1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">UUID</label>
            <input
              {...register('uuid')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="UUID del dispositivo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
            <input
              {...register('location')}
              disabled={isDisabled || (mode === 'create' && !detailsEnabled)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ubicación física"
            />
          </div>
        </div>
      </div>

      {/* Garantía y Compra */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Información de Compra
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha de Compra
            </label>
            <input
              {...register('purchaseDate')}
              type="date"
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fin de Garantía
            </label>
            <input
              {...register('warrantyEnd')}
              type="date"
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea
          {...register('notes')}
          rows={3}
          disabled={isDisabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Información adicional sobre el activo..."
        />
      </div>

      {/* Metadata (solo en modo edición) */}
      {mode === 'edit' && asset && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {asset.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {asset.createdAt ? new Date(asset.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {asset.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {asset.updatedAt ? new Date(asset.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botones (solo en modo crear) */}
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
            Crear Activo
          </ActionButton>
        </div>
      )}
    </form>
  );
}
