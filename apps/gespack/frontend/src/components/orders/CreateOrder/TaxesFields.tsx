import React from "react";
import { formatCurrency } from "../../../utils/number";
import "./TaxesFields.css";

export interface OrderTaxesProps {
    bi1?: number | null;
    tva1?: number | null;
    bi2?: number | null;
    tva2?: number | null;
    t: (key: string, params?: Record<string, any>) => string;
}

export const TaxesFields: React.FC<OrderTaxesProps> = ({ bi1 = 0, tva1 = 0, bi2 = 0, tva2 = 0, t }) => (
    <section className="section">
        <h3 className="section-title">{t("orderForm.section.taxBreakDown")}</h3>
            <div className="taxes-grid">
                <div className="tax-column">
                    <h4 className="tax-column-title">{t("orderForm.taxBreakDown.title1")}</h4>
                    <div className="taxes-item">
                        <span className="taxes-label">{t("orderForm.taxBreakDown.bi1")}</span>
                        <span className="taxes-value">{formatCurrency(bi1 ?? 0)}</span>
                    </div>
                    <div className="taxes-item">
                        <span className="taxes-label">{t("orderForm.taxBreakDown.tva1")}</span>
                        <span className="taxes-value">{formatCurrency(tva1 ?? 0)}</span>
                    </div>
                </div>
                <div className="tax-column">
                    <h4 className="tax-column-title">{t("orderForm.taxBreakDown.title2")}</h4>
                    <div className="taxes-item">
                        <span className="taxes-label">{t("orderForm.taxBreakDown.bi2")}</span>
                        <span className="taxes-value">{formatCurrency(bi2 ?? 0)}</span>
                    </div>
                    <div className="taxes-item">
                        <span className="taxes-label">{t("orderForm.taxBreakDown.tva2")}</span>
                        <span className="taxes-value">{formatCurrency(tva2 ?? 0)}</span>
                    </div>
                </div>
            </div>

            <div className="taxes-item" style={{ marginTop: '16px', fontWeight: 'bold', background: '#dcfce7', border: '1.5px solid #86efac' }}>
                <span className="taxes-label">{t("orderForm.taxBreakDown.totalSum")}</span>
                <span className="taxes-value">
                    {formatCurrency((bi1 ?? 0) + (tva1 ?? 0) + (bi2 ?? 0) + (tva2 ?? 0))}
                </span>
            </div>
    </section>
);