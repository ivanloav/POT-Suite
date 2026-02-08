import React, { useState } from "react";
import { SearchableSelect } from "../../shared/SearchableSelect";
import { useOrderProducts } from "../../../hooks/useOrderProducts";
import { round4, formatCurrency } from "../../../utils/number";
import "./OrderLinesTable.css";
import { useTranslation } from "react-i18next";

export type OrderLine = {
  line: number;
  reference?: string;
  description?: string | null;
  qty: number;
  price?: number;
  import?: number;
  weight?: number;
  vatType?: number;
  vatValue?: number;
};

interface OrderLinesTableProps {
  lines: OrderLine[];
  onChange: (lines: OrderLine[]) => void;
  onLineAdded?: () => void; // Callback cuando se añade una línea
  referenceInputRef?: React.Ref<HTMLInputElement>;
  onTabOutFromEmptyLine?: () => void; // Callback cuando Tab sale de línea sin referencia
  showPromoDialog?: boolean; // Para cerrar SearchableSelect cuando se abre PromoDiscountModal
}

interface OrderLinesTableBAVProps {
  bavPedido: string;
  setBavPedido: (pedido: string) => void;
  bavImporte: number;
  setBavImporte: (importe: number) => void;
}

export const OrderLinesTable: React.FC<OrderLinesTableProps & OrderLinesTableBAVProps> = ({
  lines,
  onChange,
  onLineAdded,
  onTabOutFromEmptyLine,
  bavPedido,
  setBavPedido,
  bavImporte,
  setBavImporte,
  showPromoDialog = false,
}) => {
  const [showBAVModal, setShowBAVModal] = useState(false);
  const { products } = useOrderProducts();
  const { t } = useTranslation("order");

  // Bloquear interacción cuando el BAV modal está abierto
  React.useEffect(() => {
    if (showBAVModal) {
      const tableElement = document.querySelector('.simple-order-lines-table');
      if (tableElement) {
        (tableElement as HTMLElement).style.pointerEvents = 'none';
      }
      
      // Cerrar todos los SearchableSelect dropdowns dentro de la tabla
      const dropdowns = tableElement?.querySelectorAll('.searchable-select-dropdown');
      dropdowns?.forEach(dropdown => {
        (dropdown as HTMLElement).style.display = 'none';
      });
    } else {
      const tableElement = document.querySelector('.simple-order-lines-table');
      if (tableElement) {
        (tableElement as HTMLElement).style.pointerEvents = 'auto';
      }
    }
    return () => {
      const tableElement = document.querySelector('.simple-order-lines-table');
      if (tableElement) {
        (tableElement as HTMLElement).style.pointerEvents = 'auto';
      }
    };
  }, [showBAVModal]);

  // Función para actualizar una línea específica
  const updateLine = (lineIndex: number, updates: Partial<OrderLine>) => {
    const newLines = [...lines];
    newLines[lineIndex] = { ...newLines[lineIndex], ...updates };

    // Si se actualiza la cantidad o el precio, recalcular import
    if ('qty' in updates || 'price' in updates) {
      const line = newLines[lineIndex];
      // Asegura que qty sea entero y nunca 0 ni vacío
      const rawQty = Number.isFinite(line.qty) ? line.qty! : 1;
      const qty = Math.max(1, Math.floor(rawQty)); // entero mínimo 1
      const price = Number.isFinite(line.price) ? line.price! : 0;
      //const weight = Number.isFinite(line.weight) ? line.weight! : 0;

      newLines[lineIndex].qty = qty; // normalizamos como entero
      newLines[lineIndex].import = round4(qty * price);
    }
    
    onChange(newLines);
  };

  // Función para agregar una nueva línea
  const addNewLine = () => {
    const newLine: OrderLine = {line: lines.length + 1, qty: 1};
    onChange([...lines, newLine]);
    
    // Llamar al callback de scroll si está definido
    if (onLineAdded) {
      onLineAdded();
    }
  };

  // Función para eliminar una línea
  const removeLine = (lineIndex: number) => {
    if (lines.length <= 1) return; // Mantener al menos una línea
    const newLines = lines.filter((_, index) => index !== lineIndex);
    // Reajustar números de línea
    newLines.forEach((line, index) => {
      line.line = index + 1;
    });
    onChange(newLines);
  };

  // Función para eliminar líneas vacías al final
  const removeEmptyLines = () => {
    const newLines = lines.filter((line, index) => {
      // Mantener la primera línea siempre, eliminar las demás si están vacías
      return index === 0 || line.reference;
    });
    
    // Si no queda ninguna línea, crear una nueva
    if (newLines.length === 0) {
      newLines.push({line: 1, qty: 1});
    }
    
    // Reajustar números de línea
    newLines.forEach((line, index) => {
      line.line = index + 1;
    });
    
    onChange(newLines);
  };

  // Función para buscar productos - filtrado local
  const handleProductSearch = async (query: string) => {
    const term = query.trim().toLowerCase();
    
    // Si no hay término de búsqueda, devolver productos vacíos (el SearchableSelect ya tiene las options)
    if (!term) {
      return [];
    }
    
    // Filtrar productos localmente
    const filtered = products.filter(product => 
      product.productRef.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term))
    );
    
    return filtered.map(product => ({
      value: product.productRef,
      label: `${product.productRef} - ${product.description || ''}`,
    }));
  };

  // Función para manejar la selección de producto
  const handleProductSelect = (lineIndex: number, value: string | null) => {
    if (value) {
      // Buscar el producto completo para obtener todos los datos
      const product = products.find(p => p.productRef === value);
      
      if (product) {
        updateLine(lineIndex, {
          reference: product.productRef,
          description: product.description,
          price: Number(product.price || '0'),
          weight: Number(product.weight || '0'),
          vatType: product.vatType,
          vatValue: product.vatValue ? Number(product.vatValue) : 0,
        });
      }
    } else {
      updateLine(lineIndex, {
        reference: '',
        description: '',
        price: 0,
        weight: 0,
        vatType: undefined,
        vatValue: undefined,
      });
    }
  };

  // Función para manejar el cambio de cantidad con Tab
  const handleQuantityChange = (lineIndex: number, value: string) => {
    const parsed = parseInt(value, 10);
    const qty = Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
    updateLine(lineIndex, { qty });
  };

  // Función para manejar la tecla Tab en cantidad
  const handleQuantityKeyDown = (e: React.KeyboardEvent, lineIndex: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleQuantityChange(lineIndex, input.value);
      
      // Si es Shift+Tab, ir hacia atrás al campo reference
      if (e.shiftKey) {
        setTimeout(() => {
          const referenceInput = document.querySelector(
            `[data-line="${lineIndex}"] .searchable-select input`
          ) as HTMLInputElement;
          referenceInput?.focus();
        }, 50);
        return;
      }
      
      const currentLine = lines[lineIndex];
      
      // Solo crear nueva línea si hay referencia seleccionada y es la última línea
      if (currentLine.reference && lineIndex === lines.length - 1) {
        addNewLine();
        // Enfocar el siguiente campo reference
        setTimeout(() => {
          const nextReferenceInput = document.querySelector(
            `[data-line="${lineIndex + 1}"] .searchable-select input`
          ) as HTMLInputElement;
          nextReferenceInput?.focus();
        }, 100);
      } else if (!currentLine.reference) {
        // Si no hay referencia, eliminar líneas vacías y salir de la tabla
        removeEmptyLines();
        
        // Disparar callback para mostrar modal de descuento promo
        if (onTabOutFromEmptyLine) {
          onTabOutFromEmptyLine();
        } else {
          // Fallback: buscar el siguiente control fuera de la tabla
          setTimeout(() => {
            const tableContainer = document.querySelector('.simple-order-lines-table');
            const allInputs = Array.from(document.querySelectorAll(
              'input:not([disabled]):not([readonly]), button:not([disabled]), select:not([disabled]), textarea:not([disabled])'
            )) as HTMLElement[];
            
            // Encontrar inputs que están después de la tabla
            const tableIndex = allInputs.findIndex(el => tableContainer?.contains(el));
            const inputsAfterTable = allInputs.slice(tableIndex + 1);
            
            // Buscar el primer input que no esté dentro de la tabla
            const nextInput = inputsAfterTable.find(el => !tableContainer?.contains(el));
            
            if (nextInput) {
              nextInput.focus();
            }
          }, 100);
        }
      } else {
        // Enfocar el siguiente campo de cantidad si existe
        const nextQuantityInput = document.querySelector(
          `[data-line="${lineIndex + 1}"] .quantity-input`
        ) as HTMLInputElement;
        if (nextQuantityInput) {
          nextQuantityInput.focus();
          nextQuantityInput.select(); // Seleccionar todo el texto
        }
      }
    }
  };

  // Función para manejar el focus en quantity input
  const handleQuantityFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Seleccionar todo el texto cuando se hace focus
    e.target.select();
  };

  // Determinar si hay botones de eliminar visibles
  const hasDeleteButtons = lines.length > 1;

  return (
    <div className="simple-order-lines-table">
      <div className={`table-header ${hasDeleteButtons ? 'with-delete-buttons' : ''}`}>
        <div className="header-cell line-col">{t("orderForm.orderLines.line")}</div>
        <div className="header-cell reference-col">{t("orderForm.orderLines.reference")}</div>
        <div className="header-cell cant-col">{t("orderForm.orderLines.qty")}</div>
        <div className="header-cell description-col">{t("orderForm.orderLines.description")}</div>
        <div className="header-cell price-col">{t("orderForm.orderLines.price")}</div>
        <div className="header-cell import-col">{t("orderForm.orderLines.import")}</div>
        {hasDeleteButtons && <div className="header-cell actions-col"></div>}
      </div>

      <div className="table-body">
        {lines.map((line, index) => (
          <div key={line.line} className={`table-row ${hasDeleteButtons ? 'with-delete-buttons' : ''}`} data-line={index}>
            {/* LÍNEA */}
            <div className="table-cell line-col">
              <input
                type="text"
                value={line.line}
                disabled
                className="line-input"
              />
            </div>

            {/* REFERENCE */}
            <div className="table-cell reference-col">
              <div className="reference-field" data-ref-focus="true">
                <SearchableSelect
                  value={line.reference || null}
                  options={products.map(product => ({
                    value: product.productRef,
                    label: `${product.productRef} - ${product.description || ''}`,
                  }))}
                  onSearch={handleProductSearch}
                  onChange={(value) => handleProductSelect(index, value)}
                  placeholder={t("orderForm.orderLines.selectProductLine")}
                  shouldCloseDropdown={showPromoDialog || showBAVModal}
                />
              </div>
            </div>

            {/* CANT */}
            <div className="table-cell cant-col">
              <input
                type="number"
                value={line.qty ?? 1}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
                onKeyDown={(e) => handleQuantityKeyDown(e, index)}
                onFocus={handleQuantityFocus}
                className="quantity-input"
                min="1"
                step="1"
                inputMode="numeric"
                required
              />
            </div>

            {/* DESCRIPTION */}
            <div className="table-cell description-col">
              <input
                type="text"
                value={line.description || ''}
                disabled
                className="description-input"
              />
            </div>

            {/* PRICE */}
            <div className="table-cell price-col">
              <input
                type="text"
                value={formatCurrency(line.price || 0)}
                disabled
                className="price-input"
              />
            </div>

            {/* IMPORT */}
            <div className="table-cell import-col">
              <input
                type="text"
                value={formatCurrency(line.import || 0)}
                disabled
                className="import-input"
              />
            </div>

            {/* ACTIONS - Solo mostrar si hay botones de eliminar */}
            {hasDeleteButtons && (
              <div className="table-cell actions-col">
                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  className="remove-line-btn"
                  title="Eliminar línea"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="table-footer">
        <button
          type="button"
          onClick={addNewLine}
          className="add-btn"
        >
          <span>➕</span>
          <span>Agregar línea</span>
        </button>

        <button
          type="button"
          onClick={() => setShowBAVModal(true)}
          className="add-btn BAV-btn"
        >
          <span>➕</span>
          <span>BAV</span>
        </button>
      </div>
      {/* Modal BAV */}
      {showBAVModal && (
        <div className="promo-modal-overlay" onClick={e => {
          // Bloquear clicks fuera del modal, pero NO cerrar
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          // Bloquear mousedown también (para inputs y dropdowns)
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}>
          <div className="promo-modal-content" onClick={e => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <div className="promo-modal-body">
              <h3 className="promo-modal-title">Datos del BAV</h3>
              <div className="promo-modal-field">
                <label htmlFor="bav-pedido" className="promo-modal-label">Introduce el pedido del BAV</label>
                <input
                  id="bav-pedido"
                  type="text"
                  className="promo-modal-input"
                  style={{ margin: '12px 0 24px 0' }}
                  value={bavPedido}
                  onChange={e => setBavPedido(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="promo-modal-field">
                <label htmlFor="bav-importe" className="promo-modal-label">Introduce el importe</label>
                <input
                  id="bav-importe"
                  type="number"
                  min="0"
                  step="0.01"
                  className="promo-modal-input"
                  style={{ margin: '12px 0 24px 0' }}
                  value={bavImporte}
                  onChange={e => setBavImporte(Number(e.target.value))}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Aquí llamas a la función de aplicar del modal
                      setShowBAVModal(false);
                      // Si tienes lógica extra para aplicar, ponla aquí
                    }
                  }}
                />
              </div>
              <div className="promo-modal-buttons">
                <button type="button" className="promo-modal-btn promo-modal-btn-secondary" onClick={() => setShowBAVModal(false)}>Cerrar</button>
                <button type="button" className="promo-modal-btn promo-modal-btn-primary" onClick={() => setShowBAVModal(false)}>Aplicar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
