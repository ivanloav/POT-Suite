import { Link, useMatches } from "react-router-dom";
import { useLastOrderReference } from '../../hooks/useLastOrderReference';
import { useTranslation } from "react-i18next";

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
    <nav aria-label="Breadcrumb" className="bg-gray-100 dark:bg-gray-800 px-4 py-2.5 rounded-lg mb-4">
      <div className="grid grid-cols-[minmax(0,_1fr)_max-content] gap-x-4 gap-y-2 items-center">
        {crumbs.length > 0 && (
          <ul className="flex items-center flex-1 min-w-0 list-none m-0 p-0">
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              const text = c.key ? t(c.key) : c.label ?? "";
              const linkTo = c.to ?? c.toComputed;

              // Detectar si es la breadcrumb de nuevo pedido
              const isNewOrder = c.key === "breadcrumb:orders.new";

              return (
                <li 
                  key={`${linkTo}-${i}`} 
                  className={`inline-flex items-center text-gray-600 dark:text-gray-400 font-semibold ${
                    !last ? "after:content-['›'] after:mx-2.5 after:text-gray-400" : ""
                  }`}
                >
                  {!last ? (
                    <Link to={linkTo} className="inline-flex items-center no-underline text-inherit hover:text-gray-800 dark:hover:text-gray-200">
                      {c.Icon ? <c.Icon className="mr-1.5 -mt-px" /> : null}
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] inline-block align-middle">
                        {text}
                      </span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center">
                      {c.Icon ? <c.Icon className="mr-1.5 -mt-px" /> : null}
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[180px] inline-block align-middle">
                        {text}
                      </span>
                      {isNewOrder && (
                        <>
                          <span className="mx-2">›</span>
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            {nextOrderReference(typeof lastOrderReference === "string" ? lastOrderReference : null)}
                          </span>
                        </>
                      )}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Acciones como columna aparte, alineadas a la derecha */}
        {actions && (
          <div className="flex items-center gap-2 flex-wrap justify-end ml-auto">
            {actions}
          </div>
        )}
      </div>
    </nav>
  );
}