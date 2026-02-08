import { useMemo } from 'react';
import { round4 } from '../utils/number';
import type { OrderLine } from '../components/orders/CreateOrder/OrderLinesTable';

interface UseOrderCalculationsProps {
  lines: OrderLine[];
  promoDiscount: number;
  isPrivilege: string;
  clubFee: number;
  shippingCost: number;
  mandatoryFee: number;
}

const PRIVILEGE_DISCOUNT = 0.1;

export const useOrderCalculations = ({
  lines,
  promoDiscount,
  isPrivilege,
  clubFee,
  shippingCost,
  mandatoryFee,
}: UseOrderCalculationsProps) => {
  // Subtotal de líneas
  const subtotal = useMemo(() => 
    round4(lines.reduce((acc, l) => acc + (l.import ?? 0), 0)), 
    [lines]
  );

  // Subtotal con descuento promo
  const subtotalWithPromoDiscount = useMemo(
    () => subtotal - promoDiscount,
    [subtotal, promoDiscount]
  );

  // Descuento por privilegio
  const privilegeDiscount = useMemo(() => {
    if (isPrivilege === "1" || isPrivilege === "true") {
      return round4(subtotalWithPromoDiscount * PRIVILEGE_DISCOUNT);
    }
    return 0;
  }, [subtotalWithPromoDiscount, isPrivilege]);

  // Subtotal después de descuento por privilegio
  const afterPrivilegeDiscount = useMemo(
    () => subtotalWithPromoDiscount - privilegeDiscount,
    [subtotalWithPromoDiscount, privilegeDiscount]
  );

  // Total después de gastos adicionales
  const subtotalAfterFees = useMemo(
    () => round4(afterPrivilegeDiscount + clubFee + shippingCost + mandatoryFee),
    [afterPrivilegeDiscount, clubFee, shippingCost, mandatoryFee]
  );

  return {
    subtotal,
    subtotalWithPromoDiscount,
    privilegeDiscount,
    afterPrivilegeDiscount,
    subtotalAfterFees,
    PRIVILEGE_DISCOUNT,
  };
};
