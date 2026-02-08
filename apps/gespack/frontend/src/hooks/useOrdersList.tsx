// src/hooks/useOrders.ts
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import { api } from "../services/axiosConfig";
import { DateRangeFilter } from "../components/shared/DataTableFilters";
import { formatDateHour, formatDate, fmtYMD } from "../components/shared/DataTableUtils";
import { Column, PagedResponse, SortDir } from "../components/shared/DataTable";
import { useSite } from "../context/SiteContext";
import { useMySites } from "../hooks/useMySites";
import { Tooltip } from 'react-tooltip';

export interface OrderDTO {
  orderId: number;
  siteId: number;
  orderReference: string;
  brandId: number;
  firstName: string | null;
  lastName: string | null;
  paymentTypeId?: number;
  paymentTypeName?: string | null;
  orderAmount?: number;
  status: string;
  createdAt: string;
  brandName?: string;
  siteName?: string;
  paidAt?: string;
}

export function useOrdersList() {
  const [t] = useTranslation("order");
  const { siteId } = useSite();
  const { data: sites } = useMySites();

  const columns: Column<OrderDTO>[] = [
    { key: "orderId", header: t("columns.orderId"), width: 80, minWidth: 60, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.idPlaceHolder")} />
      )
    },
    { key: "siteName", header: t("columns.siteName"), width: 80, minWidth: 80, sortable: true,
      filterRender: (v, setV) => (
      <select className="filter-input status-filter-select" value={v ?? ""} onChange={e => setV(e.target.value)}>
        <option value="">{t("filters.siteNamePlaceHolder")}</option>
        {sites?.map((site) => (
              <option key={site.siteId} value={site.siteName}>
                {site.siteName}
              </option>
            ))}
      </select>
    ),
      render: (row) => row.siteName ?? row.siteId
    },
    { key: "orderReference", header: t("columns.orderReference"), width: 120, minWidth: 100, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.orderReferencePlaceHolder")} />
      )
    },
    { key: "brandName", header: t("columns.brandName"), width: 80, minWidth: 80, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.brandNamePlaceHolder")} />
      ),
      render: (row) => row.brandName ?? row.brandId // Muestra el nombre si existe, si no el id
    },
    { key: "fullName", header: t("columns.fullName"), width: 220, minWidth: 100, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.fullNamePlaceHolder")} />
      ),
      render: (row) => `${row.firstName ?? ""} ${row.lastName ?? ""}` },
    { key: "paymentTypeName", header: t("columns.paymentTypeName"), width: 100, minWidth: 80, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.paymentTypeNamePlaceHolder")} />
      ),
      render: (row) => <span className="order-paymentTypeName-cell-orderslist">{toUpperCase(row.paymentTypeName ?? row.paymentTypeId)}</span>
    },
    { key: "orderAmount", header: t("columns.orderAmount"), width: 120, minWidth: 80, sortable: true,
      filterRender: (v, setV) => (
        <input className="filter-input status-filter-select" value={v ?? ""} onChange={(e) => setV(e.target.value)} placeholder={t("filters.orderAmountPlaceHolder")} />
      ),
      render: (row) =>
        <span className="order-amount-cell-orderslist">
          {row.orderAmount != null
            ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(row.orderAmount)
            : ""}
        </span>
    },
    { key: "status", header: t("columns.status"), width: 120, minWidth: 80, sortable: true,
      filterRender: (v, setV) => (
        <select className="filter-input status-filter-select" value={v ?? ""} onChange={e => setV(e.target.value)}>
          <option value="" disabled>{t("filters.statusPlaceHolder")}</option>
          <option value="">{t("filters.statusPlaceHolder")}</option>
          <option value="pending">{t("status.pending")}</option>
          <option value="paid">{t("status.paid")}</option>
          <option value="reserved">{t("status.reserved")}</option>
          <option value="shipped">{t("status.shipped")}</option>
          <option value="invoiced">{t("status.invoiced")}</option>
          <option value="returned">{t("status.returned")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>
      ),
      render: (row) => {
        let tooltip = "";
        if (["paid", "invoiced", "shipped", "returned"].includes(row.status) && row.paidAt) {
          tooltip =  t("orderForm.toolTipDatePayment") + formatDate(row.paidAt);
        }
        return (
          <>
            <span
              className={`order-status-badge status-${row.status}`}
              data-tooltip-id={`tooltip-status-${row.orderId}`}
              data-tooltip-content={tooltip || undefined}
            >
              {t(`status.${row.status}`)}
            </span>
            {tooltip && (
              <Tooltip id={`tooltip-status-${row.orderId}`} place="top" />
            )}
          </>
        );
      }
    },
    { key: "createdAt", header: t("columns.createdAt"), width: 120, minWidth: 60, justifyContent: 'center', sortable: true,
      render: (r) => 
        <span className="order-dateCreated-cell-orderslist">{formatDateHour(r.createdAt)}</span>,
      filterRender: (v, setV) => (
        <DateRangeFilter value={v} onChange={setV} placeholder={t("filters.createdAtPlaceHolder")} />
      )
    },
  ];

  const fetchPage = useCallback(async ({ page, limit, sortBy, sortDir, filters, signal }: {
    page: number;
    limit: number;
    sortBy?: string;
    sortDir?: SortDir;
    filters: Record<string, any>;
    signal?: AbortSignal;
  }): Promise<PagedResponse<OrderDTO>> => {
    const toNum = (v: any) => Number.isFinite(Number(v)) ? Number(v) : undefined;
    const strOrUndef = (v: any) => v === undefined || v === null || v === "" ? undefined : String(v);

    const params: any = {
      page,
      limit,
      siteId,
      ...(sortBy ? { sortBy } : {}),
      ...(sortDir ? { sortDir } : {}),
    };

    if (filters["orderId"]) params.qId = toNum(filters["orderId"]);
    if (filters["siteName"]) params.qSiteName = strOrUndef(filters["siteName"]);
    if (filters["brandName"]) params.qBrandName = strOrUndef(filters["brandName"]);
    if (filters["orderReference"]) params.qOrderReference = strOrUndef(filters["orderReference"]);
    if (filters["brandId"]) params.qBrandId = toNum(filters["brandId"]);
    if (filters["fullName"]) params.qFullName = strOrUndef(filters["fullName"]);
    if (filters["paymentTypeName"]) params.qPaymentTypeName = strOrUndef(filters["paymentTypeName"]);
    if (filters["orderAmount"]) params.qOrderAmount = toNum(filters["orderAmount"]);
    if (filters["status"]) params.qStatus = strOrUndef(filters["status"]);
    if (filters["createdAt"]) {
      const f = filters["createdAt"]; // puede venir como string o como { from: Date, to: Date }
      if (f && typeof f === 'object' && (f.from || f.to)) {
        const from = f.from ? fmtYMD(f.from) : '';
        const to = f.to ? fmtYMD(f.to) : '';
        params.qCreated = from && to ? `${from}..${to}` : (from || to) || undefined;
      } else {
        params.qCreated = strOrUndef(f);
      }
    }

    const res = await api.get<PagedResponse<OrderDTO>>("/orders", { params, signal });
    return { data: res.data.data ?? [], total: res.data.total ?? 0 };
  }, [siteId]);

  return { columns, fetchPage };
}

function toUpperCase(value: string | number | undefined): React.ReactNode {
  if (typeof value === "string") return value.toUpperCase();
  if (typeof value === "number") return value;
  return "";
}