import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RotateCcw, FilterX } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sortValue?: (item: T) => any; // Función para extraer el valor de ordenación
  render?: (item: T) => React.ReactNode;
  className?: string;
  width?: string; // Ancho de la columna: usa valores CSS como '80px', '15%', '1fr', etc.
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string | number; label: string }[];
  placeholder?: string;
}

interface DataTableFiltersProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
}

export function DataTableFilters({ filters, onFilterChange }: DataTableFiltersProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleChange = (key: string, value: any) => {
    const newFilters = {
      ...filterValues,
      [key]: value || undefined,
    };
    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    setFilterValues({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filterValues).some(value => value !== undefined && value !== '');

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-white">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-sm flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800 transition-colors"
            title="Limpiar filtros"
          >
            <FilterX className="h-4 w-4" />
            Limpiar Filtros
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filters.map((filter) => (
          <div key={filter.key}>
            <label
              htmlFor={`filter-${filter.key}`}
              className="block text-sm font-medium mb-2 text-gray-700 dark:text-white"
            >
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                id={`filter-${filter.key}`}
                className="input text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              >
                <option value="">{filter.placeholder || 'Todos'}</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : filter.type === 'date' ? (
              <input
                type="date"
                id={`filter-${filter.key}`}
                className="input text-gray-900 dark:text-white bg-white dark:bg-gray-800 cursor-pointer"
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
                onClick={(e) => {
                  const input = e.target as HTMLInputElement;
                  if (input.showPicker) {
                    input.showPicker();
                  }
                }}
              />
            ) : (
              <input
                type="text"
                id={`filter-${filter.key}`}
                className="input text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                placeholder={filter.placeholder || `Buscar ${filter.label.toLowerCase()}...`}
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onSortChange?: (sortConfig: { key: string; direction: 'asc' | 'desc' } | null) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = 'No se encontraron registros',
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onSortChange,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    // Buscar la configuración de la columna actual
    const currentColumn = columns.find(col => col.key === sortConfig.key);

    const sorted = [...data].sort((a: any, b: any) => {
      let aValue: any;
      let bValue: any;

      // Si la columna tiene sortValue personalizado, usarlo
      if (currentColumn?.sortValue) {
        aValue = currentColumn.sortValue(a);
        bValue = currentColumn.sortValue(b);
      } else {
        // Lógica original
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];

        // Extraer valores para columnas especiales que requieren el objeto completo
        if (sortConfig.key === 'name') {
          aValue = a.firstName && a.lastName 
            ? `${a.firstName} ${a.lastName} ${a.secondLastName || ''}`.trim() 
            : '';
          bValue = b.firstName && b.lastName 
            ? `${b.firstName} ${b.lastName} ${b.secondLastName || ''}`.trim() 
            : '';
        } else {
          // Extraer valores de objetos anidados
          const extractors: Record<string, (item: any) => string> = {
            employee: (item) => item ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : '',
            site: (item) => item?.code || '',
            type: (item) => item?.name || '',
            model: (item) => item ? `${item.brand?.name || ''} ${item.model || ''}`.trim() : '',
            cpu: (item) => item ? `${item.vendor?.name || ''} ${item.model || ''}`.trim() : '',
            ram: (item) => item ? `${item.capacityGb}GB ${item.memType?.name || ''}`.trim() : '',
            storage: (item) => item ? `${item.capacityGb}GB ${item.driveType?.name || ''}`.trim() : '',
            status: (item) => item?.name || '',

            isActive: (item) => item ? 'Activo' : 'Inactivo',
          };

          if (extractors[sortConfig.key]) {
            aValue = extractors[sortConfig.key](aValue);
            bValue = extractors[sortConfig.key](bValue);
          }
        }
      }

      // Manejar valores vacíos
      if (aValue === null || aValue === undefined || aValue === '') return 1;
      if (bValue === null || bValue === undefined || bValue === '') return -1;

      // Convertir strings numéricos a números
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      
      if (!isNaN(aNum) && !isNaN(bNum) && String(aValue).trim() !== '' && String(bValue).trim() !== '') {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Comparación de strings
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr, 'es')
        : bStr.localeCompare(aStr, 'es');
    });

    return sorted;
  }, [data, sortConfig]);

  // Paginación
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      const newConfig = !current || current.key !== key
        ? { key, direction: 'asc' as const }
        : current.direction === 'asc'
        ? { key, direction: 'desc' as const }
        : null;
      if (onSortChange) {
        onSortChange(newConfig);
      }
      return newConfig;
    });
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  const handleLastPage = () => setCurrentPage(totalPages);

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  const handleResetSort = () => {
    setSortConfig(null);
    if (onSortChange) {
      onSortChange(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm text-gray-700 dark:text-white">
            Mostrar:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-700 dark:text-white">registros</span>
        </div>
        <div className="flex items-center gap-4">
          {sortConfig && (
            <button
              onClick={handleResetSort}
              className="px-2 py-1 text-xs flex items-center gap-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded border border-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 transition-colors"
              title="Restablecer orden"
            >
              <RotateCcw className="h-3 w-3" />
              Limpiar
            </button>
          )}
          <div className="text-sm text-gray-700 dark:text-white">
            Mostrando {startIndex + 1} a {Math.min(endIndex, sortedData.length)} de {sortedData.length} registros
          </div>
        </div>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ width: 'max-content', minWidth: '100%' }}>
          <colgroup>
            {columns.map((column) => (
              <col 
                key={column.key} 
                style={column.width ? { width: column.width } : undefined}
              />
            ))}
          </colgroup>
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider ${column.className || 'text-left'}`}
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className={`flex items-center gap-1 hover:text-gray-700 dark:hover:text-white ${column.className?.includes('text-center') ? 'justify-center w-full' : ''}`}
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={keyExtractor(item)} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'} hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 text-sm whitespace-nowrap ${column.className || 'text-left text-gray-800 dark:text-gray-100'}`}
                  >
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-6 pt-6 mt-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-white"
            title="Primera página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-white"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        <div className="text-sm text-gray-700 dark:text-white font-medium">
          Página {currentPage} de {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-white"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-white"
            title="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
