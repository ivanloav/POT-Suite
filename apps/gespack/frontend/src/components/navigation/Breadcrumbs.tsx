import { Link, useMatches } from "react-router-dom";
import { useLastOrderReference } from '../../hooks/useLastOrderReference';
import { useTranslation } from "react-i18next";
import "./Breadcrumbs.css";

// Estructura normalizada de un "crumb"
export type Crumb = {
  key?: string; // i18n key (p. ej. "breadcrumb:home")
  label?: string; // literal
  Icon?: React.ComponentType<any>;
  to?: string; // destino explícito opcional
  toComputed: string; // destino inferido del match
};

interface BreadcrumbsProps {
  actions?: React.ReactNode;
}

// Convierte cualquier forma de crumb en la estructura normalizada
function normalizeCrumb(raw: any, matchPathname: string): Crumb | null {
  if (!raw) return null;
  const { key, label, icon: Icon, to } = raw as {
    key?: string;
    label?: string;
    icon?: React.ComponentType<any>;
    to?: string;
  };
  const toComputed = (to ?? (matchPathname || "/")) as string;
  return { key, label, Icon, to, toComputed };
}

export default function Breadcrumbs({ actions }: BreadcrumbsProps) {
  // Hook para obtener la última referencia de pedido
  const { lastOrderReference } = useLastOrderReference();
  const matches = useMatches();
  const { t } = useTranslation(["breadcrumb", "sidebar", "translation"]);

  function nextOrderReference(ref: string | null): string {
    const num = ref ? parseInt(ref, 10) : 0;
    return String(num + 1).padStart(8, '0');
  }

  // Recorremos los matches y aceptamos:
  // - handle.crumb como función que puede devolver 1 crumb o un array de crumbs
  // - handle.titleKey como fallback para mostrar un texto simple
  const dynamicCrumbs: Crumb[] = matches.flatMap((m) => {
    const handle: any = m.handle ?? {};
    const path = (m as any).pathname || (m as any).pathnameBase || "/";

    if (typeof handle.crumb === "function") {
      const out = handle.crumb(m);
      if (Array.isArray(out)) {
        return out
          .map((c) => normalizeCrumb(c, path))
          .filter((c): c is Crumb => Boolean(c));
      }
      const single = normalizeCrumb(out, path);
      return single ? [single] : [];
    }

    // Fallback: si hay titleKey/title en el handle, creamos un crumb simple
    if (handle.titleKey || handle.title) {
      return [
        {
          key: handle.titleKey, // p. ej. "breadcrumb:userList"
          label: handle.title,
          toComputed: path,
        },
      ];
    }

    return [];
  });

  // Usamos solo los crumbs que vienen desde el router (evitamos duplicar Home)
  const crumbs: Crumb[] = dynamicCrumbs;

  if (!crumbs.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <div className="breadcrumbs-container">
        {crumbs.length > 0 && (
          <ul className="breadcrumbs-list">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              const text = c.key ? t(c.key) : c.label ?? "";
              const linkTo = c.to ?? c.toComputed;

              // Detectar si es la breadcrumb de nuevo pedido
              const isNewOrder = c.key === "breadcrumb:orders.new";

              return (
                <li key={`${linkTo}-${i}`} className={last ? "current" : ""}>
                  {!last ? (
                    <Link to={linkTo}>
                      {c.Icon ? <c.Icon className="crumb-icon" /> : null}
                      <span>{text}</span>
                    </Link>
                  ) : (
                    <>
                      {c.Icon ? <c.Icon className="crumb-icon" /> : null}
                      <span>{text}</span>
                      {isNewOrder && (
                        <span style={{ margin: '0 0.5em' }}>›</span>
                      )}
                      {isNewOrder && (
                        <span style={{ fontWeight: 500, color: '#888' }}>{nextOrderReference(typeof lastOrderReference === "string" ? lastOrderReference : null)}</span>
                      )}
                    </>
                  )}
                </li>
              );
            })}

            {/* Acciones como último <li>, alineado a la derecha */}
            {actions && <li className="breadcrumbs-actions actions">{actions}</li>}
          </ul>
        )}
      </div>
    </nav>
  );
}