import React from "react";
import  "./CustomerFields.css";
import { SearchableSelect } from "../../shared/SearchableSelect";

interface Props {
    formData: Record<string, any>;
    setFormData: (data: Record<string, any>) => void;
    t: (key: string, params?: Record<string, any>) => string;
    errors: Record<string, string | null>;
    clearFieldError: (name: string) => void;
    setFieldError: (name: string, message: string | null) => void;
    customerTypesOptions?: { value: string; label: string }[];
    sourcesOptions?: { value: string; label: string }[];
    actionsOptions?: { value: string; label: string }[];
    customerTypesLoading?: boolean;
    sourcesLoading?: boolean;
    actionsLoading?: boolean;
    searchCustomerTypes: (query: string) => Promise<any[]>;
    searchSources: (query: string) => Promise<any[]>;
    searchActions: (query: string) => Promise<any[]>;
    searchCustomers: (query: string) => Promise<any[]>;
    applyCustomerSelection: (customer: any, label?: string) => void;
    handleCBReaderKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    handleBlurFixed: (e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => void;
    handleBlurMobile: (e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => void;
    handleBlurEmail: (e: React.FocusEvent<HTMLInputElement>, t?: (key: string) => string, notify?: any) => void;
    notify?: any;
    customerTypeOptions?: { value: string; label: string }[];
    sourceOptions?: { value: string; label: string }[];
    
    actions?: any[];
    actionOptions?: { value: string; label: string }[];

    customers?: any[];
    customersLoading?: boolean;
    customerOptions?: { value: string; label: string }[];
    applyActionSelection: (actions: any, label?: string) => void;
    setOrderSourceId?: (id: string) => void;
}

export const CustomerFields: React.FC<Props> = ({
    formData,
    setFormData,
    t,
    errors,
    clearFieldError,
    setFieldError,
    customerTypesOptions,
    sourcesOptions,
    actionsOptions,
    customerTypesLoading,
    sourcesLoading,
    actionsLoading,
    searchCustomerTypes,
    searchSources,
    searchActions,
    searchCustomers,
    applyCustomerSelection,
    handleCBReaderKeyDown,
    handleBlurFixed,
    handleBlurMobile,
    handleBlurEmail,
    customerTypeOptions,
    sourceOptions,
    actions = [],
    actionOptions,
    customers = [],
    customersLoading = false,
    customerOptions = [],
    applyActionSelection,
    notify,
    setOrderSourceId
}) => {

    // Prioridad: usar customerTypesOptions si existe, si no customerTypeOptions
    const customerTypeOpts = customerTypesOptions || customerTypeOptions || [];
    const sourceOpts = sourcesOptions || sourceOptions || [];
    const actionOpts = actionsOptions || actionOptions || [];
    
    return (
    <section className="section">
        <h3 className="section-title">{t("orderForm.section.orderData") || "Datos del pedido"}</h3>
        <div className="grid grid-2">
            <div className="field">
            <label>{t("orderForm.CBReader")}</label>
            <input
                type="text"
                autoComplete="off"
                value={formData.CBReader || ""}
                onChange={(e) => {
                    const value = e.target.value;
                    if (formData.CBReader !== value) {
                        setFormData((prev: Record<string, any>) => ({ ...prev, CBReader: value }));
                    }
                    clearFieldError("CBReader");
                }}
                onKeyDown={handleCBReaderKeyDown}
                autoFocus
                placeholder={t("orderForm.readCB")}
            />
            </div>

            <div className="field">
            <label>{t("orderForm.source")}</label>
            <SearchableSelect
                value={formData.orderSourceId}
                placeholder={sourcesLoading ? t("orderForm.loading") : t("orderForm.selectSource")}
                options={sourceOpts}
                onSearch={async (v) =>
                    (await searchSources(v)).map((s) => ({ value: String(s.orderSourceId), label: s.sourceName }))
                }
                minChars={1}
                debounceMs={300}
                isDisabled={sourcesLoading}
                noOptionsMessage={t("orderForm.noSources")}
                onChange={(value) => {
                    setOrderSourceId && setOrderSourceId(value || "");
                    setFieldError("orderSourceId", value ? null : (errors.orderSourceId ?? null));
                }}
                className={errors.orderSourceId ? "ss-invalid" : undefined}
                ariaInvalid={!!errors.orderSourceId}
            />
            </div>

            <div className="field">
            <label>{t("orderForm.action")}</label>
            <SearchableSelect
                value={formData.actionId}
                placeholder={actionsLoading ? t("orderForm.loading") : t("orderForm.selectAction")}
                options={actionOpts}
                onSearch={async (v) =>
                    (await searchActions(v)).map((a) => ({ value: String(a.actionId), label: a.actionName, ...a }))
                }
                minChars={1}
                debounceMs={300}
                isDisabled={actionsLoading}
                noOptionsMessage={t("orderForm.noActions")}
                onChange={(value, label) => {
                    const selected = actions.find((a) => String(a.actionId) === value);
                    if (selected) {
                        clearFieldError("action");
                        applyActionSelection(selected, label || undefined);
                    } else {
                        setFieldError("action", "Acción inválida");
                    }
                }}
                className={errors.action ? "ss-invalid" : undefined}
                aria-invalid={!!errors.action}
            />
            </div>

            <div className="field">
            <label>{t("orderForm.participant")}</label>
            <input
                type="text"
                value={formData.participant}
                onChange={(e) => {
                    const value = e.target.value;
                    setFormData((prev: Record<string, any>) => ({ ...prev, participant: value }));
                }}
                required
            />
            </div>

            <div className="field">
            <label>{t("orderForm.customer")}</label>
            <SearchableSelect
                value={formData.customer ? String(formData.customer) : null}
                placeholder={t("orderForm.selectCustomer")}
                options={customerOptions}
                onSearch={async (v) =>
                    (await searchCustomers(v)).map((c) => ({
                        value: String(c.customerId),
                        label: `${c.customerCode} - ${c.customerFirstName} ${c.customerLastName}`,
                    }))
                }
                minChars={1}
                debounceMs={300}
                isDisabled={customersLoading}
                noOptionsMessage={t("orderForm.noCustomers")}
                onChange={(value, label) => {
                    const selected = customers.find((c) => String(c.customerId) === value);
                    if (selected) {
                        clearFieldError("customer");
                        applyCustomerSelection(selected, label || undefined);
                    } else {
                        setFieldError("customer", "Cliente inválido");
                    }
                }}
                className={errors.customer ? "ss-invalid" : undefined}
                aria-invalid={!!errors.customer}
            />
            </div>

            <div className="field">
            <label>{t("orderForm.customerType")}</label>
            <SearchableSelect
                value={formData.customerType || null}
                placeholder={t("orderForm.selectCustomerType")}
                options={customerTypeOpts}
                onSearch={async (v) =>
                    (await searchCustomerTypes(v)).map((ct) => ({
                        value: String(ct.typeCode),
                        label: `${ct.typeCode} - ${ct.typeName}`,
                    }))
                }
                minChars={1}
                debounceMs={300}
                isDisabled={customerTypesLoading}
                noOptionsMessage={t("orderForm.noCustomerTypes")}
                onChange={(value) => {
                    setFormData((prev: Record<string, any>) => ({ ...prev, customerType: value || "" }));
                    setFieldError("customerType", value ? null : errors.customerType ?? null);
                }}
                className={errors.customerType ? "ss-invalid" : undefined}
                aria-invalid={!!errors.customerType}
            />
            </div>
        </div>
        {formData.customerMarkedName
            ? <div className="info-warning-customer">{formData.customerMarkedName}</div>
            : <br /> }

        <div className="grid-customer">
            <div className="field address">
            {/*<label>{t("orderForm.customerAddress")}</label>*/}
            <div className="address-view">
                {formData.customerAddress ? (
                <span className="address-text">{formData.customerAddress}</span>
                ) : (
                <span className="address-placeholder">{t("orderForm.customerAddress")}</span>
                )}
            </div>
            </div>
            <div className="field extra-info-customer phone">
            <label>{t("orderForm.customerPhone")}</label>
            <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={formData.customerPhone}
                onChange={(e) => {
                const value = e.target.value;
                setFormData((prev: Record<string, any>) => ({ ...prev, customerPhone: value }));
                // opcional: limpiar error mientras escribe
                if (errors.customerPhone) setFieldError('customerPhone', null);
                }}
                onBlur={(e) => handleBlurFixed(e, t, notify)}
                className={errors.customerPhone ? "input-invalid" : undefined}
                aria-invalid={!!errors.customerPhone}
                placeholder={t("orderForm.customerPhone")}
            />
            </div>

            <div className="field extra-info-customer mobile">
            <label>{t("orderForm.customerMobile")}</label>
            <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={formData.customerMobile}
                onChange={(e) => {
                const value = e.target.value;
                setFormData((prev: Record<string, any>) => ({ ...prev, customerMobile: value }));
                if (errors.customerMobile) setFieldError('customerMobile', null);
                }}
                onBlur={(e) => handleBlurMobile(e, t, notify)}
                className={errors.customerMobile ? "input-invalid" : undefined}
                aria-invalid={!!errors.customerMobile}
                placeholder={t("orderForm.customerMobile")}
            />
            </div>
            <div className="field extra-info-customer email">
            <label>{t("orderForm.customerEmail")}</label>
            <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={formData.customerEmail}
                onChange={(e) => {
                const value = e.target.value;
                setFormData((prev: Record<string, any>) => ({ ...prev, customerEmail: value }));
                if (errors.customerEmail) setFieldError('customerEmail', null);
                }}
                onBlur={(e) => handleBlurEmail(e, t, notify)}
                className={errors.customerEmail ? "input-invalid" : undefined}
                aria-invalid={!!errors.customerEmail}
                placeholder={t("orderForm.customerEmail")}
            />
            </div>
        </div>
    </section>
  );
};
