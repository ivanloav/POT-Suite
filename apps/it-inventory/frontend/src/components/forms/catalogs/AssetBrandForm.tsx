import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetBrandsService } from '@/services/assetBrandsService';
import { assetCpuVendorService } from '@/services/assetCpuVendorService';
import { assetRamMemoryTypeService } from '@/services/assetRamMemoryTypeService';
import { AssetOsFamiliesService } from '@/services/assetOsFamiliesService';
import { brandCpuCompatibilityService } from '@/services/brandCpuCompatibilityService';
import { brandRamCompatibilityService } from '@/services/brandRamCompatibilityService';
import { brandOsCompatibilityService } from '@/services/brandOsCompatibilityService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Edit2, Save, X } from 'lucide-react';
import { ActionButton } from '../../shared/ActionButton';

interface AssetBrandFormData {
  name: string;
  isActive: boolean;
}

interface AssetBrandFormProps {
  mode: 'create' | 'edit';
  brandId?: number;
  onSuccess: () => void;
  onCancel: () => void;
  onHeaderButtons?: (buttons: React.ReactNode) => void;
}

export default function AssetBrandForm({ mode, brandId, onSuccess, onCancel, onHeaderButtons }: AssetBrandFormProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(mode === 'create');
  const [selectedCpuVendors, setSelectedCpuVendors] = useState<number[]>([]);
  const [selectedRamTypes, setSelectedRamTypes] = useState<number[]>([]);
  const [selectedOsFamilies, setSelectedOsFamilies] = useState<number[]>([]);
  const canManage = useAuthStore((state) => state.canManage);
  const canEdit = canManage('catalogs') || canManage('assetBrands');

  const { data: brandData, isLoading } = useQuery({
    queryKey: ['asset-brands', brandId],
    queryFn: () => assetBrandsService.getById(brandId!),
    enabled: mode === 'edit' && !!brandId,
  });

  // Cargar opciones disponibles
  const { data: cpuVendorsData } = useQuery({
    queryKey: ['asset-cpu-vendors'],
    queryFn: () => assetCpuVendorService.getAll(),
  });

  const { data: ramTypesData } = useQuery({
    queryKey: ['asset-ram-memory-types'],
    queryFn: () => assetRamMemoryTypeService.getAll(),
  });

  const { data: osFamiliesData } = useQuery({
    queryKey: ['asset-os-families'],
    queryFn: () => AssetOsFamiliesService.getAll(),
  });

  // Cargar compatibilidades actuales en modo edit
  const { data: cpuCompatData } = useQuery({
    queryKey: ['brand-cpu-compat', brandId],
    queryFn: () => brandCpuCompatibilityService.getByBrand(brandId!),
    enabled: mode === 'edit' && !!brandId,
  });

  const { data: ramCompatData } = useQuery({
    queryKey: ['brand-ram-compat', brandId],
    queryFn: () => brandRamCompatibilityService.getByBrand(brandId!),
    enabled: mode === 'edit' && !!brandId,
  });

  const { data: osCompatData } = useQuery({
    queryKey: ['brand-os-compat', brandId],
    queryFn: () => brandOsCompatibilityService.getByBrand(brandId!),
    enabled: mode === 'edit' && !!brandId,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssetBrandFormData>({
    defaultValues: {
      isActive: true,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && brandData?.data) {
      const brand = brandData.data;
      reset({
        name: brand.name,
        isActive: brand.isActive,
      });
    }
  }, [brandData, reset, mode]);

  // Cargar compatibilidades seleccionadas
  useEffect(() => {
    if (mode === 'edit' && cpuCompatData?.data) {
      setSelectedCpuVendors(cpuCompatData.data.map(c => c.cpuVendorId));
    }
  }, [cpuCompatData, mode]);

  useEffect(() => {
    if (mode === 'edit' && ramCompatData?.data) {
      setSelectedRamTypes(ramCompatData.data.map(c => c.ramTypeId));
    }
  }, [ramCompatData, mode]);

  useEffect(() => {
    if (mode === 'edit' && osCompatData?.data) {
      setSelectedOsFamilies(osCompatData.data.map(c => c.osFamilyId));
    }
  }, [osCompatData, mode]);

  const createMutation = useMutation({
    mutationFn: assetBrandsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-brands'] });
      toast.success('Marca creada exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la marca');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AssetBrandFormData) => {
      // Actualizar marca
      const result = await assetBrandsService.update(brandId!, data);
      
      // Actualizar compatibilidades
      if (brandId) {
        // CPU Vendors
        const currentCpuIds = cpuCompatData?.data?.map(c => c.cpuVendorId) || [];
        const toAddCpu = selectedCpuVendors.filter(id => !currentCpuIds.includes(id));
        const toRemoveCpu = currentCpuIds.filter(id => !selectedCpuVendors.includes(id));
        
        for (const cpuVendorId of toAddCpu) {
          await brandCpuCompatibilityService.create({ brandId, cpuVendorId });
        }
        for (const cpuVendorId of toRemoveCpu) {
          await brandCpuCompatibilityService.delete({ brandId, cpuVendorId });
        }

        // RAM Types
        const currentRamIds = ramCompatData?.data?.map(c => c.ramTypeId) || [];
        const toAddRam = selectedRamTypes.filter(id => !currentRamIds.includes(id));
        const toRemoveRam = currentRamIds.filter(id => !selectedRamTypes.includes(id));
        
        for (const ramTypeId of toAddRam) {
          await brandRamCompatibilityService.create({ brandId, ramTypeId });
        }
        for (const ramTypeId of toRemoveRam) {
          await brandRamCompatibilityService.delete({ brandId, ramTypeId });
        }

        // OS Families
        const currentOsIds = osCompatData?.data?.map(c => c.osFamilyId) || [];
        const toAddOs = selectedOsFamilies.filter(id => !currentOsIds.includes(id));
        const toRemoveOs = currentOsIds.filter(id => !selectedOsFamilies.includes(id));
        
        for (const osFamilyId of toAddOs) {
          await brandOsCompatibilityService.create({ brandId, osFamilyId });
        }
        for (const osFamilyId of toRemoveOs) {
          await brandOsCompatibilityService.delete({ brandId, osFamilyId });
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asset-brands', brandId] });
      queryClient.invalidateQueries({ queryKey: ['asset-brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand-cpu-compat', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brand-ram-compat', brandId] });
      queryClient.invalidateQueries({ queryKey: ['brand-os-compat', brandId] });
      toast.success('Marca actualizada exitosamente');
      setIsEditing(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar la marca');
    },
  });

  const onSubmit = (data: AssetBrandFormData) => {
    if (mode === 'create') {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    if (brandData?.data) {
      const brand = brandData.data;
      reset({
        name: brand.name,
        isActive: brand.isActive,
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
                form="assetbrand-form"
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
    } else if (mode === 'create' && onHeaderButtons) {
      onHeaderButtons(null);
    }
  }, [mode, isEditing, canEdit, updateMutation.isPending, onHeaderButtons]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Cargando...</div>
      </div>
    );
  }

  const brand = brandData?.data;
  const isDisabled = mode === 'edit' && !isEditing;

  return (
    <form id="assetbrand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Marca <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('name', {
                required: 'El nombre es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' }
              })}
              disabled={isDisabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ej: Apple, Dell, HP, Lenovo"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {mode === 'edit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <div className="flex items-center gap-3 h-[42px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    disabled={isDisabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {brand?.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sección de Compatibilidades */}
      {mode === 'edit' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Compatibilidades
          </h3>
          
          {/* CPU Vendors */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fabricantes de CPU Compatibles
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {cpuVendorsData?.data?.map((vendor: any) => (
                <label key={vendor.id} className="flex items-center py-1.5 hover:bg-white dark:hover:bg-gray-800 px-2 rounded-lg cursor-pointer transition-colors duration-150 group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCpuVendors.includes(vendor.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCpuVendors([...selectedCpuVendors, vendor.id]);
                        } else {
                          setSelectedCpuVendors(selectedCpuVendors.filter(id => id !== vendor.id));
                        }
                      }}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed mr-2.5"></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{vendor.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RAM Types */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipos de Memoria RAM Compatibles
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {ramTypesData?.data?.map((ramType: any) => (
                <label key={ramType.id} className="flex items-center py-1.5 hover:bg-white dark:hover:bg-gray-800 px-2 rounded-lg cursor-pointer transition-colors duration-150 group">
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRamTypes.includes(ramType.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRamTypes([...selectedRamTypes, ramType.id]);
                        } else {
                          setSelectedRamTypes(selectedRamTypes.filter(id => id !== ramType.id));
                        }
                      }}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed mr-2.5"></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ramType.name}</span>
                </label>
              ))}
            </div>
          </div>

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

      {mode === 'edit' && brand && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Información del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Creado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brand.creator?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brand.createdAt ? new Date(brand.createdAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Actualizado por:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brand.updater?.userName || 'N/A'}
              </span>
              <br />
              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {brand.updatedAt ? new Date(brand.updatedAt).toLocaleString('es-ES') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === 'create' && (
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
            Crear Marca
          </ActionButton>
        </div>
      )}
    </form>
  );
}
