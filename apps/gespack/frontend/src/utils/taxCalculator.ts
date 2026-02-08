import { round4 } from './number';
import type { OrderLine } from '../components/orders/CreateOrder/OrderLinesTable';

/**
 * Calcula BI y TVA agrupados por vatType
 * Descuentos y gastos se distribuyen proporcionalmente según el peso de cada vatType
 * BI = importe / (1 + vatValue)
 * TVA = importe - BI
 * 
 * @param lines - líneas de productos
 * @param promoDiscount - descuento por promo
 * @param privilegeDiscount - descuento por privilege
 * @param clubFee - fee por club privilege
 * @param shippingCost - costo de envío
 * @param mandatoryFee - gasto obligatorio
 */
export const calculateVatTotalsByType = (
  lines: OrderLine[],
  promoDiscount: number = 0,
  privilegeDiscount: number = 0,
  clubFee: number = 0,
  shippingCost: number = 0,
  mandatoryFee: number = 0
) => {
  let subtotal1 = 0;
  let subtotal2 = 0;

  // Calcular subtotales por vatType (solo productos)
  lines.forEach((line) => {
    const importe = line.import ?? 0;

    if (line.vatType === 1) {
      subtotal1 = round4(subtotal1 + importe);
    } else if (line.vatType === 2) {
      subtotal2 = round4(subtotal2 + importe);
    }
  });

  // Total de productos
  const totalSubtotal = round4(subtotal1 + subtotal2);

  // Calcular pesos (proporciones) para distribución
  const weight1 = totalSubtotal > 0 ? subtotal1 / totalSubtotal : 0.5;
  const weight2 = totalSubtotal > 0 ? subtotal2 / totalSubtotal : 0.5;

  // Distribuir descuentos y gastos proporcionalmente
  const promoDiscount1 = round4(promoDiscount * weight1);
  const promoDiscount2 = round4(promoDiscount * weight2);

  const privilegeDiscount1 = round4(privilegeDiscount * weight1);
  const privilegeDiscount2 = round4(privilegeDiscount * weight2);

  const clubFee1 = round4(clubFee * weight1);
  const clubFee2 = round4(clubFee * weight2);

  const shippingCost1 = round4(shippingCost * weight1);
  const shippingCost2 = round4(shippingCost * weight2);

  const mandatoryFee1 = round4(mandatoryFee * weight1);
  const mandatoryFee2 = round4(mandatoryFee * weight2);

  // Calcular subtotales finales (después de descuentos y gastos)
  const finalSubtotal1 = round4(
    subtotal1 - promoDiscount1 - privilegeDiscount1 + clubFee1 + shippingCost1 + mandatoryFee1
  );
  const finalSubtotal2 = round4(
    subtotal2 - promoDiscount2 - privilegeDiscount2 + clubFee2 + shippingCost2 + mandatoryFee2
  );

  // Calcular BI y TVA para cada vatType
  let bi1 = 0;
  let tva1 = 0;
  let bi2 = 0;
  let tva2 = 0;

  // VAT Type 1
  lines.forEach((line) => {
    if (line.vatType === 1) {
      const importe = line.import ?? 0;
      const vatValue = (line.vatValue ?? 0); // decimal: 0.05, 0.21, etc
      const bi = round4(importe / (1 + vatValue));
      const tva = round4(importe - bi);

      bi1 = round4(bi1 + bi);
      tva1 = round4(tva1 + tva);
    }
  });

  // Aplicar descuentos y gastos a Type 1 (preservando proporción de BI/TVA)
  if (finalSubtotal1 !== subtotal1 && subtotal1 > 0) {
    const avgVatRate1 = tva1 > 0 ? round4(tva1 / bi1) : 0;
    const adjustmentAmount1 = round4(finalSubtotal1 - subtotal1);
    const biAdjust1 = round4(adjustmentAmount1 / (1 + avgVatRate1));
    const tvaAdjust1 = round4(adjustmentAmount1 - biAdjust1);

    bi1 = round4(bi1 + biAdjust1);
    tva1 = round4(tva1 + tvaAdjust1);
  }

  // VAT Type 2
  lines.forEach((line) => {
    if (line.vatType === 2) {
      const importe = line.import ?? 0;
      const vatValue = (line.vatValue ?? 0);
      const bi = round4(importe / (1 + vatValue));
      const tva = round4(importe - bi);

      bi2 = round4(bi2 + bi);
      tva2 = round4(tva2 + tva);
    }
  });

  // Aplicar descuentos y gastos a Type 2 (preservando proporción de BI/TVA)
  if (finalSubtotal2 !== subtotal2 && subtotal2 > 0) {
    const avgVatRate2 = tva2 > 0 ? round4(tva2 / bi2) : 0;
    const adjustmentAmount2 = round4(finalSubtotal2 - subtotal2);
    const biAdjust2 = round4(adjustmentAmount2 / (1 + avgVatRate2));
    const tvaAdjust2 = round4(adjustmentAmount2 - biAdjust2);

    bi2 = round4(bi2 + biAdjust2);
    tva2 = round4(tva2 + tvaAdjust2);
  }

  return {
    bi1: round4(bi1),
    tva1: round4(tva1),
    total1: round4(bi1 + tva1),
    bi2: round4(bi2),
    tva2: round4(tva2),
    total2: round4(bi2 + tva2),
  };
};
