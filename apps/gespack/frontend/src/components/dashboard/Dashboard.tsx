import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import { createSwapy } from "swapy";
import { StatusCard } from "./StatusCard";
import {
  fetchDashboardConfig,
  fetchDashboardKpis,
  KpisResponse,
  resetDashboardConfig,
  saveDashboardConfig,
} from "../../api/Dashboard";
import { useSetBreadcrumbActions } from "../../hooks/useBreadcrumbActions";
import { FaUndoAlt } from "react-icons/fa";
import "./Dashboard.css";

type CardKey =
  | "pending-invoicing"
  | "products-pending"
  | "out-of-stock"
  | "recorded"
  | "pending-payment"
  | "invoiced";

const DEFAULT_ORDER: CardKey[] = [
  "pending-invoicing",
  "products-pending",
  "out-of-stock",
  "recorded",
  "pending-payment",
  "invoiced",
];

export const Dashboard: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const navigate = useNavigate();
  const { selectedSite } = useOutletContext<{ selectedSite: number | null }>();
  const siteForQuery = selectedSite ?? 0;

  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<ReturnType<typeof createSwapy> | null>(null);

  // cache del nuevo orden mientras arrastras
  const latestOrderRef = useRef<CardKey[] | null>(null);

  const [kpis, setKpis] = useState<KpisResponse | null>(null);
  const [cardOrder, setCardOrder] = useState<CardKey[]>(DEFAULT_ORDER);

  const SLOTS = ["slot-0", "slot-1", "slot-2", "slot-3", "slot-4", "slot-5"];

  const breadCrumbActions = useMemo(() => (
    <>
        <button className="btn btn-warning" onClick={() => resetOrder()}>
          <FaUndoAlt /> <span>{t("actions.resetCard")}</span>
        </button>
    </>
  ), [t]);

  useSetBreadcrumbActions(breadCrumbActions);

  // (opcional) cargar orden guardado
  const loadConfig = useCallback(async () => {
    try {
      const cfg = await fetchDashboardConfig(siteForQuery);
      if (Array.isArray(cfg.cardOrder) && cfg.cardOrder.length === DEFAULT_ORDER.length) {
        const sanitized = cfg.cardOrder.filter((k: string): k is CardKey =>
          (DEFAULT_ORDER as string[]).includes(k)
        );
        if (sanitized.length === DEFAULT_ORDER.length) setCardOrder(sanitized);
      }
    } catch {
      /* noop */
    }
  }, [siteForQuery]);

  const resetOrder = async () => {
    try {
      await resetDashboardConfig(siteForQuery);
      setCardOrder([
        "pending-invoicing",
        "products-pending",
        "out-of-stock",
        "recorded",
        "pending-payment",
        "invoiced",
      ]);
    } catch {
      // silencioso
    }
  };

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Init Swapy (1 sola vez). Capturamos el nuevo orden y lo aplicamos al SOLTAR.
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  // Asegura que la estructura ya está en el DOM este tick
  const init = () => {
    // destruye si había algo residual
    swapyRef.current?.destroy();
    swapyRef.current = createSwapy(container, {
      swapMode: "hover",
      autoScrollOnDrag: true,
      // NO uses manualSwap aquí; con hover + confirmación en pointerup va fino
    });

    // Capturamos el nuevo orden solo en memoria (sin setState aún)
    swapyRef.current.onSwap((evt: any) => {
      const mapObj = evt?.newSlotItemMap?.asObject as Record<string, string> | undefined;
      if (!mapObj) return;
      latestOrderRef.current = SLOTS.map((slotKey) => mapObj[slotKey]) as CardKey[];
    });
  };

  // Pequeño defer para garantizar que los data-* existen ya en el DOM
  const raf = requestAnimationFrame(init);

  // Manejadores para UX y confirmación del orden
  const onPointerDown = () => container.classList.add("is-dragging");
  const onPointerUp = () => {
    container.classList.remove("is-dragging");
    const next = latestOrderRef.current;
    latestOrderRef.current = null;
    if (next && next.join("|") !== cardOrder.join("|")) {
      // 1) actualiza UI
      setCardOrder(next);
      // 2) persiste (no re-crea swapy porque este effect NO depende de cardOrder)
      saveDashboardConfig(siteForQuery, next).catch(() => {});
    }
  };

  container.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });

  return () => {
    cancelAnimationFrame(raf);
    container.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("pointerup", onPointerUp);
    swapyRef.current?.destroy();
    swapyRef.current = null;
  };
// 👇 ONLY re-init when cambia de sitio (o si cambias la estructura de slots)
}, [siteForQuery, cardOrder]);

  // KPIs (normal)
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetchDashboardKpis(siteForQuery);
        if (mounted) setKpis(res);
      } catch {/* noop */}
    };
    run();
    const id = setInterval(run, 15000);
    return () => { mounted = false; clearInterval(id); };
  }, [siteForQuery]);

  // navegación
  const goOrders   = (q: string) => () => navigate(`/orders?${q}`);
  const goProducts = (q: string) => () => navigate(`/products?${q}`);

  const cardConfigs: Record<CardKey, {
    title: string; countKey: keyof KpisResponse; color: string; footer: string; onClick: () => void;
  }> = {
    "pending-invoicing": {
      title: t("card.orders.pendingInvoicing"),
      countKey: "ordersPendingInvoicing",
      color: "#8B0000",
      footer: t("card.footer.orders"),
      onClick: goOrders("status=reserved"),
    },
    "products-pending": {
      title: t("card.products.pendingInvoicing"),
      countKey: "productsPendingInvoicing",
      color: "#A52A2A",
      footer: t("card.footer.products"),
      onClick: goProducts("pendingInvoicing=true"),
    },
    "out-of-stock": {
      title: t("card.products.outOfStock"),
      countKey: "productsOutOfStock",
      color: "#D32F2F",
      footer: t("card.footer.products"),
      onClick: goProducts("stock=0"),
    },
    "recorded": {
      title: t("card.orders.recorded"),
      countKey: "ordersRecorded",
      color: "#16A349",
      footer: t("card.footer.orders"),
      onClick: goOrders("status=pending"),
    },
    "pending-payment": {
      title: t("card.orders.pendingPayment"),
      countKey: "ordersPendingPayment",
      color: "#FBBF24",
      footer: t("card.footer.orders"),
      onClick: goOrders("paid=false"),
    },
    "invoiced": {
      title: t("card.orders.invoiced"),
      countKey: "ordersInvoiced",
      color: "#F59E0B",
      footer: t("card.footer.orders"),
      onClick: goOrders("status=invoiced"),
    },
  };

  return (
    <div className="dashboard-content">
      <div 
        ref={containerRef} 
        className="dashboard-grid" 
        data-swapy-container
      >
        {SLOTS.map((slotKey, idx) => {
          const cardId = cardOrder[idx];
          const cfg = cardConfigs[cardId];

          return (
            <div key={slotKey + "|" + cardId} data-swapy-slot={slotKey} className="swapy-slot">
              {/* IMPORTANTE: el data-swapy-item debe ser el id real de la card */}
              <div data-swapy-item={cardId} className="swapy-item">
                {/* toda la card como handle */}
                <div data-swapy-handle className="swapy-handle">
                  <StatusCard
                    title={cfg.title}
                    count={kpis?.[cfg.countKey] ?? 0}
                    color={cfg.color}
                    footerLabel={cfg.footer}
                    onClick={cfg.onClick}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};