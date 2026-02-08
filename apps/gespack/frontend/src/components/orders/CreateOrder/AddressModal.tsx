import React, { useState, useEffect } from "react";
import "./AddressModal.css";

interface AddressData {
  nombre: string;
  direccion1: string;
  direccion2: string;
  direccion3: string;
  direccion4: string;
  direccion5: string;
  cp: string;
  poblacion: string;
  telfMovil: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (billingAddress: AddressData, shippingAddress: AddressData) => void;
  initialBillingAddress: AddressData;
  initialShippingAddress: AddressData;
  t: (key: string, params?: Record<string, any>) => string;
}

const emptyAddress: AddressData = {
  nombre: "",
  direccion1: "",
  direccion2: "",
  direccion3: "",
  direccion4: "",
  direccion5: "",
  cp: "",
  poblacion: "",
  telfMovil: "",
};

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBillingAddress,
  initialShippingAddress,
  t,
}) => {
  const [activeTab, setActiveTab] = useState<'billing' | 'shipping'>('billing');
  const [billingAddress, setBillingAddress] = useState<AddressData>(emptyAddress);
  const [shippingAddress, setShippingAddress] = useState<AddressData>(emptyAddress);

  useEffect(() => {
    if (isOpen) {
      // Al abrir el modal, inicializar con los datos guardados
      setBillingAddress(initialBillingAddress);
      setShippingAddress(initialShippingAddress);
    }
  }, [isOpen, initialBillingAddress, initialShippingAddress]);

  const handleSave = () => {
    onSave(billingAddress, shippingAddress);
    // No cerramos aquí, lo hace el padre en onSave
  };

  const handleCancel = () => {
    onClose();
  };

  const handleBillingChange = (field: keyof AddressData, value: string) => {
    setBillingAddress({ ...billingAddress, [field]: value });
  };

  const handleShippingChange = (field: keyof AddressData, value: string) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  if (!isOpen) return null;

  const currentAddress = activeTab === 'billing' ? billingAddress : shippingAddress;
  const handleChange = activeTab === 'billing' ? handleBillingChange : handleShippingChange;

  return (
    <div className="address-modal-overlay">
      <div className="address-modal-content">
        <div className="address-modal-header">
          <h2>{t('orderForm.modifyAddress')}
            {activeTab === 'billing' ? t('orderForm.billingAddress') : t('orderForm.shippingAddress')}
          </h2>
          <button className="address-modal-close" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="address-modal-tabs">
          <button
            className={`address-tab ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            {t('orderForm.billingAddress').charAt(0).toUpperCase() + t('orderForm.billingAddress').slice(1)}
          </button>
          <button
            className={`address-tab ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            {t('orderForm.shippingAddress').charAt(0).toUpperCase() + t('orderForm.shippingAddress').slice(1)}
          </button>
        </div>

        <div className="address-modal-body">
          <div className="address-form">
            <div className="address-form-group">
              <label>{t('orderForm.name')}</label>
              <input
                type="text"
                value={currentAddress.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder={t('orderForm.namePlaceholder')}
              />
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.address1')}</label>
              <input
                type="text"
                value={currentAddress.direccion1}
                onChange={(e) => handleChange('direccion1', e.target.value)}
                placeholder={t('orderForm.address1Placeholder')}
              />
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.address2')}</label>
              <input
                type="text"
                value={currentAddress.direccion2}
                onChange={(e) => handleChange('direccion2', e.target.value)}
                placeholder={t('orderForm.address2Placeholder')}
              />
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.address3')}</label>
              <input
                type="text"
                value={currentAddress.direccion3}
                onChange={(e) => handleChange('direccion3', e.target.value)}
                placeholder={t('orderForm.address3Placeholder')}
              />
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.address4')}</label>
              <input
                type="text"
                value={currentAddress.direccion4}
                onChange={(e) => handleChange('direccion4', e.target.value)}
                placeholder={t('orderForm.address4Placeholder')}
              />
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.address5')}</label>
              <input
                type="text"
                value={currentAddress.direccion5}
                onChange={(e) => handleChange('direccion5', e.target.value)}
                placeholder={t('orderForm.address5Placeholder')}
              />
            </div>

            <div className="address-form-row">
              <div className="address-form-group">
                <label>{t('orderForm.postalCode')}</label>
                <input
                  type="text"
                  value={currentAddress.cp}
                  onChange={(e) => handleChange('cp', e.target.value)}
                  placeholder={t('orderForm.postalCodePlaceholder')}
                />
              </div>

              <div className="address-form-group">
                <label>{t('orderForm.city')}</label>
                <input
                  type="text"
                  value={currentAddress.poblacion}
                  onChange={(e) => handleChange('poblacion', e.target.value)}
                  placeholder={t('orderForm.cityPlaceholder')}
                />
              </div>
            </div>

            <div className="address-form-group">
              <label>{t('orderForm.mobile')}</label>
              <input
                type="text"
                value={currentAddress.telfMovil}
                onChange={(e) => handleChange('telfMovil', e.target.value)}
                placeholder={t('orderForm.mobilePlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="address-modal-footer">
          <button className="address-btn-cancel" onClick={handleCancel}>
            {t('actions.cancel')}
          </button>
          <button className="address-btn-save" onClick={handleSave}>
            {t('actions.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
