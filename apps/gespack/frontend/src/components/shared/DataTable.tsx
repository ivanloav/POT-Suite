import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./DataTable.css";
import { FaRedo, FaSyncAlt } from "react-icons/fa";

export type SortDir = "ASC" | "DESC";
export interface PagedResponse<T> { data: T[]; total: number; }

export type Column<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  justifyContent?: 'start' | 'center' | 'end';
  sortable?: boolean;
  className?: string;
  render?: (row: T) => React.ReactNode;                         // cómo pintar celda
  filterRender?: (value: any, setValue: (v:any)=>void) => React.ReactNode; // filtro en cabecera
};

export interface DataTableProps<T> {
  title?: React.ReactNode;
  titleActions?: React.ReactNode;
  columns: Column<T>[];
  fetchPage: (args: {
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDir;
    filters: Record<string, any>;
    signal?: AbortSignal;
  }) => Promise<PagedResponse<T>>;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortDir?: SortDir;
  initialFilters?: Record<string, any>;
  toolbarRight?: React.ReactNode;
}

export function DataTable<T>(props: DataTableProps<T>) {
  const { t } = useTranslation("datatable");

  const {
    columns,
    fetchPage,
    initialLimit = 10,
    initialSortBy,
    initialSortDir = "DESC",
    initialFilters = {},
    toolbarRight,
  } = props;

  const [rows, setRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const MAX_W = 800;
  const colW = useMemo(() => {
    const map: Record<string, number> = {};
    columns.forEach((c) => { map[String(c.key)] = c.width ?? 120; });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init only

  const [widths, setWidths] = useState<Record<string, number>>(colW);
  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWRef = useRef(0);
  const resizingKeyRef = useRef<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const controllerRef = useRef<AbortController | null>(null);

  // fetch
  useEffect(() => {
    const ctrl = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = ctrl;

    setLoading(true);
    setError(null);
    fetchPage({ page, limit, sortBy, sortDir, filters, signal: ctrl.signal })
      .then((res) => { setRows(res.data ?? []); setTotal(res.total ?? 0); })
      .catch((err) => {
        if (err?.name === "CanceledError") return;
        const msg = err?.response?.data?.message || err?.message || t("error");
        setError(Array.isArray(msg) ? msg.join(", ") : msg);
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [page, limit, sortBy, sortDir, JSON.stringify(filters), refreshTick, fetchPage, t]);

  // sorting
  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "ASC" ? "DESC" : "ASC"));
    } else {
      setSortBy(key);
      setSortDir("ASC");
    }
  };

  const sortIcon = (key: string) => {
    if (sortBy !== key) return "↑↓";
    return sortDir === "ASC" ? "↑" : "↓";
  };

  // resizer
  const minWRef = useRef(40);
  const maxWRef = useRef<number>(MAX_W);

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLTableCellElement>, key: string, min = 40, max = MAX_W) => {
    const th = e.currentTarget;
    const rect = th.getBoundingClientRect();
    const clickX = e.clientX;
    const rightEdge = rect.right;
    
    // Solo iniciar redimensionamiento si el click está en los últimos 12px del header
    if (clickX >= rightEdge - 12) {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      startXRef.current = e.clientX;
      startWRef.current = widths[key] ?? 120;
      resizingKeyRef.current = key;
      minWRef.current = min ?? 40;
      maxWRef.current = max ?? MAX_W;

      document.body.classList.add("resizing-columns");
      window.addEventListener("mousemove", onResizerMove as any);
      window.addEventListener("mouseup", onResizerUp as any);
    }
  };

  const handleHeaderMouseMove = (e: React.MouseEvent<HTMLTableCellElement>) => {
    if (isResizingRef.current) return; // No cambiar cursor mientras se redimensiona
    
    const th = e.currentTarget;
    const rect = th.getBoundingClientRect();
    const mouseX = e.clientX;
    const rightEdge = rect.right;
    
    // Cambiar cursor cuando esté en los últimos 12px
    if (mouseX >= rightEdge - 12) {
      th.style.cursor = 'col-resize';
    } else {
      th.style.cursor = 'default';
    }
  };

  const onResizerMove = (e: MouseEvent) => {
    if (!isResizingRef.current || !resizingKeyRef.current) return;
    const dx = e.clientX - startXRef.current;
    const key = resizingKeyRef.current;
    const base = startWRef.current;
    const min = minWRef.current ?? 40;
    const max = maxWRef.current ?? MAX_W;
    const next = Math.max(min, Math.min(max, base + dx));
    setWidths((prev) => ({ ...prev, [key]: next }));
  };

  const onResizerUp = () => {
    isResizingRef.current = false;
    resizingKeyRef.current = null;
    document.body.classList.remove("resizing-columns");
    window.removeEventListener("mousemove", onResizerMove as any);
    window.removeEventListener("mouseup", onResizerUp as any);
  };

  // helpers
  const setFilter = (k: string, v: any) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [k]: v }));
  };
  const handleReset = () => {
    setPage(1);
    setFilters({});            // limpia todos los filtros
    setSortBy(undefined);      // quita el orden actual
    setSortDir(initialSortDir);
    setLimit(initialLimit);
  };

  return (
    <div className="data-table-container">
      <div className="data-table-card">
        <div className="data-table-toolbar data-table-card-toolbar">
          <div className="data-table-limit">
            <select
              id="limitSel"
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
            >
              {[10, 25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="data-table-total">{t("total")}: {total}</div>

          <div className="data-table-actions">
            <button className="btn btn-refresh" type="button" onClick={() => setRefreshTick((n) => n + 1)}>
              <FaSyncAlt style={{ marginRight: "4px" }} /> {t("refresh")}
            </button>
            <button className="btn btn-reset" type="button" onClick={handleReset}>
              <FaRedo style={{ marginRight: "4px" }} /> {t("reset")}
            </button>
            {toolbarRight}
          </div>
        </div>

        <div className="data-table-scroll">
          <table className="data-table-table data-table-resizable">
            <colgroup>
              {columns.map((c) => (
                <col
                  key={String(c.key)}
                  style={{ width: widths[String(c.key)] ?? c.width ?? 120 }}
                />
              ))}
            </colgroup>

            <thead>
              <tr>
                {columns.map((c) => (
                  <th
                    key={String(c.key)}
                    className={[c.sortable ? "data-table-th-sortable" : "", c.className].filter(Boolean).join(" ")}
                    onMouseDown={(e) => handleHeaderMouseDown(e, String(c.key), c.minWidth, c.maxWidth ?? MAX_W)}
                    onMouseMove={(e) => handleHeaderMouseMove(e)}
                    onMouseLeave={(e) => e.currentTarget.style.cursor = 'default'}
                  >
                    <span className="data-table-th-label">
                      {c.header}
                      {c.sortable && (
                        <span
                          className="data-table-sort-icon"
                          onClick={() => toggleSort(String(c.key))}
                          style={{ cursor: 'pointer', marginLeft: 4 }}
                          title={sortDir === 'ASC' ? 'Orden ascendente' : 'Orden descendente'}
                        >
                          {sortIcon(String(c.key))}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>

              <tr className="data-table-filter-row">
                {columns.map((c) => (
                  <th key={String(c.key)}>
                    {c.filterRender
                      ? c.filterRender(filters[String(c.key)], (v) => setFilter(String(c.key), v))
                      : (
                        <input
                          className="data-table-filter-input"
                          value={filters[String(c.key)] ?? ""}
                          onChange={(e) => setFilter(String(c.key), e.target.value)}
                          placeholder={`Filter ${String(c.key)}`}
                        />
                      )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={columns.length} className="data-table-status">
                    {t("loading")}
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={columns.length} className="data-table-status data-table-error">
                    ⚠ {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="data-table-status">
                    {t("noData")}
                  </td>
                </tr>
              )}

              {!loading && !error && rows.map((r, idx) => (
                <tr key={idx}>
                  {columns.map((c) => (
                    <td key={String(c.key)} className={c.className}>
                      {c.render ? c.render(r) : (r as any)[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="data-table-pagination">
        <button disabled={page <= 1} onClick={() => setPage(1)}>&laquo;</button>
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>&lsaquo;</button>
        <span className="data-table-page-indicator">{page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>&rsaquo;</button>
        <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}>&raquo;</button>
      </div>
    </div>
  );
}