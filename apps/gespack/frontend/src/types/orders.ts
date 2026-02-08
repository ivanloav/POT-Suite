/**
 * Tipos compartidos para órdenes/pedidos
 */

export interface PaymentTypeField { 
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  [key: string]: any;
}

export interface OrderFormData {
  CBReader: string;
  orderSourceId: string;
  actionId: string;
  participant: string;
  customer: string;
  customerLabel: string;
  customerType: string;
  customerCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerAddress: string;
  customerPostalCode: string;
  customerCity: string;
  customerCountry: string;
  customerPhone: string;
  customerMobile: string;
  customerEmail: string;
  customerMarkedName: string;
  isPrivilege: string;
  priorityTypes: string;
  paymentTypes: string;
  role: string;
  siteId: number;
  siteName: string;
  section: string;
  shippingCost?: number;
  mandatoryFee?: number;
  [key: string]: any;
}

export interface OrderAddress {
  billingCustomerName: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingAddressLine3: string;
  billingAddressLine4: string;
  billingAddressLine5: string;
  billingPostalCode: string;
  billingCity: string;
  billingMobilePhone: string;
  shippingCustomerName: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string;
  shippingAddressLine3: string;
  shippingAddressLine4: string;
  shippingAddressLine5: string;
  shippingPostalCode: string;
  shippingCity: string;
  shippingMobilePhone: string;
}

export interface OrderSource {
  orderSourceId: number;
  sourceName: string;
}

export interface OrderAction {
  actionId: number;
  actionName: string;
  mandatoryFee?: number;
}

export interface OrderCustomer {
  customerId?: number;
  customerCode: string;
  customerFirstName: string;
  customerLastName: string;
  customerAddress?: string;
  customerPostalCode?: string;
  customerCity?: string;
  customerCountry?: string;
  customerPhone?: string;
  customerMobile?: string;
  customerEmail?: string;
  customerMarkedName?: string;
  isPrivilege?: string | boolean;
  shippingGender?: string;
}

export interface OrderCustomerType {
  customerTypeId: number;
  typeCode: number;
  typeName: string;
}

export interface PriorityType {
  actionPriorityId: number;
  priorityName: string;
  shippingCost?: number;
}

export interface PaymentType {
  orderPaymentTypeId: number;
  paymentType: string;
  description?: string;
  fields?: PaymentTypeField[];
}

export interface ParsedCBData {
  orderReference?: string;
  customerCode?: string;
  customerName?: string;
  actionId?: string;
  amount?: number;
  [key: string]: any;
}
