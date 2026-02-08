import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignmentsService, Assignment } from '@/services/assignmentsService';
import { assetsService } from '@/services/assetsService';
import { employeesService } from '@/services/employeesService';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { Save, X, Undo2 } from 'lucide-react';
import { ActionButton } from '../shared/ActionButton';

interface AssignmentFormData {
  assetId: string;
  employeeId: string;
  assignedAt: string;
  returnedAt: string;
  comment: string;
}

interface AssignmentFormProps {
  mode: 'create' | 'return';
  assignment?: Assignment;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AssignmentForm({ mode, assignment, onSuccess, onCancel }: AssignmentFormProps) {
  const queryClient = useQueryClient();
  const selectedSiteId = useAuthStore((state) => state.selectedSiteId);

  // Función para obtener la fecha/hora actual en formato datetime-local considerando zona horaria de España
  const getLocalDateTimeString = (date: Date = new Date()) => {
    // Convertir a zona horaria de España
    const spainDate = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    const year = spainDate.getFullYear();
    const month = String(spainDate.getMonth() + 1).padStart(2, '0');
    const day = String(spainDate.getDate()).padStart(2, '0');
    const hours = String(spainDate.getHours()).padStart(2, '0');
    const minutes = String(spainDate.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState<AssignmentFormData>({
    assetId: mode === 'return' && assignment ? String(assignment.assetId) : '',
    employeeId: mode === 'return' && assignment ? String(assignment.employeeId) : '',
    assignedAt: mode === 'return' && assignment 
      ? getLocalDateTimeString(new Date(assignment.assignedAt))
      : getLocalDateTimeString(),
    returnedAt: getLocalDateTimeString(),
    comment: mode === 'return' && assignment?.comment ? assignment.comment : '',
  });

  const { data: assetsResponse } = useQuery({
    queryKey: ['assets', selectedSiteId],
    queryFn: () => assetsService.getAll(selectedSiteId ? { siteId: selectedSiteId } : undefined),
    enabled: mode === 'create',
  });

  const { data: employeesResponse } = useQuery({
    queryKey: ['employees', selectedSiteId],
    queryFn: () => employeesService.getAll(selectedSiteId ? { siteId: selectedSiteId } : undefined),
    enabled: mode === 'create',
  });

  const assets = assetsResponse?.data || [];
  const employees = employeesResponse?.data || [];

  // Filtrar activos que estén activos (no en reparación ni retirados)
  const activeAssets = assets.filter((asset: any) => {
    const statusCode = asset.status?.code;
    return statusCode === 'in_stock' || statusCode === 'assigned';
  });

  // Obtener el activo seleccionado
  const selectedAsset = activeAssets.find((a: any) => String(a.id) === formData.assetId);
  
  // Filtrar empleados solo del site del activo seleccionado
  const filteredEmployees = selectedAsset
    ? employees.filter((emp: any) => String(emp.siteId) === String(selectedAsset.siteId))
    : [];

  const createMutation = useMutation({
    mutationFn: (data: any) => assignmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asignación creada exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear la asignación');
    },
  });

  const returnMutation = useMutation({
    mutationFn: (data: any) => assignmentsService.return(assignment!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Activo devuelto exitosamente');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al devolver el activo');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'return') {
      // Modo devolución
      if (!formData.returnedAt) {
        toast.error('Por favor, ingrese la fecha de devolución');
        return;
      }

      returnMutation.mutate({
        returnedAt: formData.returnedAt,
        comment: formData.comment || undefined,
      });
      return;
    }

    // Modo crear
    if (!formData.assetId || !formData.employeeId) {
      toast.error('Por favor, complete todos los campos obligatorios');
      return;
    }

    if (!selectedAsset) {
      toast.error('Activo no encontrado');
      return;
    }

    createMutation.mutate({
      siteId: Number(selectedAsset.siteId),
      assetId: Number(formData.assetId),
      employeeId: Number(formData.employeeId),
      assignedAt: formData.assignedAt,
      comment: formData.comment || undefined,
    });
  };

  if (mode === 'return' && assignment) {
    // Modo devolución
    return (
      <form id="assignment-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Activo:</strong> {assignment.asset.assetTag} - {assignment.asset.model.brand.name} {assignment.asset.model.name}
          </p>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Empleado:</strong> {assignment.employee.firstName} {assignment.employee.lastName}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Devolución
          </label>
          <input
            type="datetime-local"
            value={formData.returnedAt}
            onChange={(e) => setFormData({ ...formData, returnedAt: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comentarios
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="input"
            rows={3}
            placeholder="Motivo de la devolución o comentarios adicionales"
          />
        </div>

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
            icon={Undo2}
            loading={returnMutation.isPending}
            loadingText="Devolviendo..."
          >
            Devolver
          </ActionButton>
        </div>
      </form>
    );
  }

  // Modo crear
  return (
    <form id="assignment-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="assignment-asset"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Activo <span className="text-red-500">*</span>
        </label>
        <select
          id="assignment-asset"
          value={formData.assetId}
          onChange={(e) => setFormData({ ...formData, assetId: e.target.value, employeeId: '' })}
          className="input"
          required
        >
          <option value="">Seleccione un activo</option>
          {activeAssets.map((asset: any) => (
            <option key={asset.id} value={asset.id}>
              {asset.assetTag} - {asset.model.brand.name} {asset.model.name} ({asset.site?.code || 'Sin sede'})
              {asset.status?.code === 'assigned' && asset.employee ? ` - Asignado a ${asset.employee.firstName} ${asset.employee.lastName}` : ''}
            </option>
          ))}
        </select>
        {activeAssets.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            No hay activos activos disponibles
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="assignment-employee"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Empleado <span className="text-red-500">*</span>
        </label>
        <select
          id="assignment-employee"
          value={formData.employeeId}
          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
          className="input"
          required
          disabled={!formData.assetId}
        >
          <option value="">
            {!formData.assetId ? 'Primero seleccione un activo' : 'Seleccione un empleado'}
          </option>
          {filteredEmployees.map((employee: any) => (
            <option key={employee.id} value={employee.id}>
              {employee.firstName} {employee.lastName}
            </option>
          ))}
        </select>
        {formData.assetId && filteredEmployees.length === 0 && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            No hay empleados disponibles en la sede del activo seleccionado
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="assignment-assigned-at"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Fecha de Asignación
        </label>
        <input
          id="assignment-assigned-at"
          type="datetime-local"
          value={formData.assignedAt}
          onChange={(e) => setFormData({ ...formData, assignedAt: e.target.value })}
          className="input"
        />
      </div>

      <div>
        <label
          htmlFor="assignment-comment"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Comentarios
        </label>
        <textarea
          id="assignment-comment"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          className="input"
          rows={3}
          placeholder="Comentarios adicionales sobre la asignación"
        />
      </div>

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
          loadingText="Guardando..."
        >
          Guardar
        </ActionButton>
      </div>
    </form>
  );
}
