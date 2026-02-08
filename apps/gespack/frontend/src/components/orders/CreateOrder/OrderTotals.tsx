import React from "react";
import { formatCurrency } from "../../../utils/number";
import "./OrderTotals.css";

export interface OrderTotalsProps {
    subtotal: number;
    promoDiscount: number;
    clubFee: number;
    currentCalcPrivilege: number;
    totalWithoutBAV: number;
    totalOrder: number;
    t: (key: string, params?: Record<string, any>) => string;
    shippingCost: number;
    mandatoryFee: number;
    bavPedido?: string;
    bavImporte?: number;
    onApplyPromo?: () => void;
    onRemovePromo?: () => void;
}

export const OrderTotals: React.FC<OrderTotalsProps> = ({ subtotal, totalWithoutBAV, totalOrder, promoDiscount, clubFee, currentCalcPrivilege, t, shippingCost, mandatoryFee, bavPedido = "", bavImporte = 0 }) => (
    <div className="order-totals">
        <div className="totals-grid">
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.subtotal")}</span>
            <span className="totals-value">{formatCurrency(subtotal)}</span>
        </div>
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.discount")}</span>
            <span className="totals-value">{formatCurrency(promoDiscount)}</span>
        </div>
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.clubPriv")}</span>
            <span className="totals-value">{formatCurrency(clubFee)}</span>
        </div>
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.discountPriv")}</span>
            <span className="totals-value">{formatCurrency(currentCalcPrivilege)}</span>
        </div>
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.priorityShipping")}</span>
            <span className="totals-value">{formatCurrency(shippingCost)}</span>
        </div>
        <div className="totals-item">
            <span className="totals-label">{t("orderForm.orderLines.mandatoryFee")}</span>
            <span className="totals-value">{formatCurrency(mandatoryFee)}</span>
        </div>
        <div className="totals-item total-order">
            <span className="totals-label">{t("orderForm.orderLines.totalOrder")}</span>
            <span className="totals-value">{formatCurrency(totalWithoutBAV)}</span>
        </div>
        <div className="totals-item bav-order">
                <span className="totals-label">{t("orderForm.orderLines.bav")}</span>
                {bavPedido && (
                    <span className="totals-bav-pedido">{bavPedido}</span>
                )}
                <span className="totals-value">{formatCurrency(bavImporte)}</span>
        </div>
        <div className="totals-item total-final">
            <span className="totals-label">{t("orderForm.orderLines.total")}</span>
            <span className="totals-value">{formatCurrency(totalOrder)}</span>
        </div>
        </div>
    </div>
);
