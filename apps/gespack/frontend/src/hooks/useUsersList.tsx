import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import { useCallback, useMemo } from "react";
import { api } from "../services/axiosConfig";
import { Column, PagedResponse, SortDir } from "../components/shared/DataTable";
import { BooleanFilter, DateRangeFilter } from "../components/shared/DataTableFilters";
import { formatDateHour, fmtYMD } from "../components/shared/DataTableUtils";
import { useSite } from "../context/SiteContext";

// ====== Tipos del backend ======
interface UserDTO {
  userId: number;
  email: string;
  userName?: string | null;
  isCustomer?: boolean;
  isAdmin?: boolean;
  isActive?: boolean;
  isCB?: boolean;
  isList?: boolean;
  totalSite?: number;
  sendDailyOrdersReport?: number;
  createdAt?: string; // ISO
}

export function useUsersList(onUserClick?: (userId: number) => void) {
    const [t] = useTranslation("users");
    const siteId = useSite();

    const columns: Column<UserDTO>[] = useMemo(() =>[
      { key: "userId", header: t("columns.id"), width: 60, minWidth: 40, sortable: true, className: "col-id",
        filterRender: (v, setV) => (
          <input className="filter-input" value={v ?? ""} onChange={(e)=>setV(e.target.value)} placeholder={t("filters.idPlaceHolder")} />
        )
      },
      { key: "userName", header: t("columns.userName"), width: 160, minWidth: 80, sortable: true,
        render: (r) => onUserClick ? (
          <button
            className="user-name-link"
            onClick={() => onUserClick(r.userId)}
            style={{ background: "none", border: "none", color: '#007bff', textDecoration: 'underline', padding: 0, cursor: "pointer" }}
          >
            {r.userName || "-"}
          </button>
        ) : (r.userName || "-"),
        filterRender: (v, setV) => (
          <input className="filter-input" value={v ?? ""} onChange={(e)=>setV(e.target.value)} placeholder={t("filters.userNamePlaceHolder")} />
        )
      },
      { key: "email", header: t("columns.email"), width: 200, minWidth: 120, sortable: true, className: "break-anywhere",
        filterRender: (v, setV) => (
          <input className="filter-input" value={v ?? ""} onChange={(e)=>setV(e.target.value)} placeholder={t("filters.emailPlaceHolder")} />
        )
      },
      { key: "isCustomer", header: t("columns.isCustomer"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.isCustomer ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter
            value={v}
            onChange={setV}
            anyLabel={t("filters.any")}
            yesLabel={t("yes")}
            noLabel={t("no")}
          />
        )
      },
      { key: "isCB", header: t("columns.isCB"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.isCB ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter value={v} onChange={setV} anyLabel={t("filters.any")} yesLabel={t("yes")} noLabel={t("no")} />
        )
      },
      { key: "isList", header: t("columns.isList"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.isList ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter value={v} onChange={setV} anyLabel={t("filters.any")} yesLabel={t("yes")} noLabel={t("no")} />
        )
      },
      { key: "totalSite", header: t("columns.totalSite"), width: 120, minWidth: 80, sortable: true,
        filterRender: (v, setV) => (
          <input className="filter-input" value={v ?? ""} onChange={(e)=>setV(e.target.value)} placeholder={t("filters.totalSitePlaceHolder")} />
        )
      },
      { key: "sendDailyOrdersReport", header: t("columns.sendDailyOrdersReport"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.sendDailyOrdersReport ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter value={v} onChange={setV} anyLabel={t("filters.any")} yesLabel={t("yes")} noLabel={t("no")} />
        )
      },
      { key: "isAdmin", header: t("columns.isAdmin"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.isAdmin ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter value={v} onChange={setV} anyLabel={t("filters.any")} yesLabel={t("yes")} noLabel={t("no")} />
        )
      },
      { key: "isActive", header: t("columns.isActive"), width: 120, minWidth: 80, sortable: true,
        render: (r) => (r.isActive ? t("yes") : t("no")),
        filterRender: (v, setV) => (
          <BooleanFilter value={v} onChange={setV} anyLabel={t("filters.any")} yesLabel={t("yes")} noLabel={t("no")} />
        )
      },
      { key: "createdAt", header: t("columns.createdAt"), width: 160, minWidth: 120, sortable: true,
        render: (r) => formatDateHour(r.createdAt),
        filterRender: (v, setV) => (
          <DateRangeFilter value={v} onChange={setV} placeholder={t("filters.createdRangePlaceHolder")} />
        )
      },
    ], [t, onUserClick]);

  // fetcher genérico: convierte los filters en los params que espera tu backend
  const fetchPage = useCallback(async ({ page, limit, sortBy, sortDir, filters, signal }: {    
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDir;
    filters: Record<string, any>;
    signal?: AbortSignal;
  }): Promise<PagedResponse<UserDTO>> => {
    // Ayudas para forzar los valores del filtro a lo que espera el backend
    const toBool = (v: any) => {
      if (v === true || v === false) return v;
      if (typeof v === "string") {
        const vl = v.trim().toLowerCase();
        if (vl === "true" || vl === "1" || vl === "sí" || vl === "si") return true;
        if (vl === "false" || vl === "0" || vl === "no") return false;
      }
      return undefined; // no mandar el filtro si está vacío
    };
    const toNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) && v !== "" ? n : undefined;
    };
    const strOrUndef = (v: any) =>
      v === undefined || v === null || v === "" ? undefined : String(v);

    const params: any = {
      page,
      limit,
      ...(sortBy ? { sortBy } : {}),
      ...(sortDir ? { sortDir } : {}),

      // textos / números
      qId: toNum(filters["userId"]),
      qUserName: strOrUndef(filters["userName"]),
      qEmail: strOrUndef(filters["email"]),
      qTotalSite: toNum(filters["totalSite"]),

      // booleanos
      qIsCustomer: toBool(filters["isCustomer"]),
      qIsCB: toBool(filters["isCB"]),
      qIsList: toBool(filters["isList"]),
      qSendDailyOrdersReport: toBool(filters["sendDailyOrdersReport"]),
      qIsAdmin: toBool(filters["isAdmin"]),
      qIsActive: toBool(filters["isActive"]),
    };

    // fecha o rango "YYYY-MM-DD" o "YYYY-MM-DD..YYYY-MM-DD"
    if (filters["createdAt"]) {
      const f = filters["createdAt"]; // puede venir como string o como { from: Date, to: Date }
      if (f && typeof f === 'object' && (f.from || f.to)) {
        const from = f.from ? fmtYMD(f.from) : '';
        const to = f.to ? fmtYMD(f.to) : '';
        params.qCreated = from && to ? `${from}..${to}` : (from || to);
      } else {
        params.qCreated = strOrUndef(f);
      }
    }

    const res = await api.get<PagedResponse<UserDTO>>("/users", { params, signal });
    return { data: res.data.data ?? [], total: res.data.total ?? 0 };
  }, [siteId]);

  return { columns, fetchPage };
}