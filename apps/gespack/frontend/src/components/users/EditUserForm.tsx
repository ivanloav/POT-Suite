// frontend/src/components/users/EditUserForm.tsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../shared/BaseModal";
import { BaseForm, FormField, SelectField, BooleanSelectField, MultiSelectField, CheckboxField } from "../shared/BaseForm";
import { PasswordField } from "../shared/PasswordField";
import { fetchUserById } from "../../api/users";
import { fetchAllSites, Site } from "../../api/sites";
import { devLog } from "../../utils/logger";
import { validateUserForm } from "../../utils/validation";
import "./CreateEditUserForm.css";

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => Promise<void>;
  userId: number | null;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ isOpen, onClose, onSubmit, userId }) => {
  const { t } = useTranslation(["users", "lang"]);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    locale: "",
    selectedSites: [] as number[],
    isCustomer: false,
    isAdmin: false,
    isActive: false,
    isCB: false,
    isList: false,
    isDailyOrdersReport: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Cargar datos del usuario cuando se abra el modal
  useEffect(() => {
    if (isOpen && userId) {
      loadUserData(userId);
    }
  }, [isOpen, userId]);

  // Cargar sites
  useEffect(() => {
    if (isOpen) {
      loadSites();
    }
  }, [isOpen]);

  const loadUserData = async (id: number) => {
    setIsLoading(true);
    try {
        const userData = await fetchUserById(id);
        
        if (!userData) {
            devLog.error("Usuario no encontrado o data es null");
            alert("Usuario no encontrado");
            return;
        }
        
        setFormData({
        name: userData.userName || userData.name || "",
        email: userData.email || "",
        password: "", // Dejar vacío por seguridad
        locale: userData.locale || "",
        // 👈 MEJORAR: Manejar sites que pueden venir como array de objetos Site o array de IDs
        selectedSites: userData.sites?.map((site: Site | number) => {
            if (typeof site === 'object' && 'siteId' in site) {
            return site.siteId;
            }
            return typeof site === 'number' ? site : Number(site);
        }) || [],
        isCustomer: Boolean(userData.isCustomer),
        isAdmin: Boolean(userData.isAdmin),
        isActive: Boolean(userData.isActive),
        isCB: Boolean(userData.isCB),
        isList: Boolean(userData.isList),
        isDailyOrdersReport: Boolean(
            userData.isDailyOrdersReport || 
            userData.sendDailyOrdersReport
        ),
        });
    } catch (error) {
        devLog.error("Error loading user data:", error);
        alert("Error al cargar los datos del usuario");
    } finally {
        setIsLoading(false);
    }
  };


  const loadSites = async () => {
    setLoadingSites(true);
    try {
        const sitesData = await fetchAllSites();
        setSites(sitesData);
    } catch (error) {
        devLog.error("Error loading sites:", error);
    } finally {
        setLoadingSites(false);
    }
    };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        locale: "",
        selectedSites: [],
        isCustomer: false,
        isAdmin: false,
        isActive: false,
        isCB: false,
        isList: false,
        isDailyOrdersReport: false,
      });
      setErrors({});
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = validateUserForm(formData, false);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData: any = { ...formData };
      // Si no hay contraseña, no la incluir en la actualización
      if (!formData.password.trim()) {
        delete updateData.password;
      }
      
      await onSubmit(updateData);
    } catch (error) {
      devLog.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: "" }));
    }
  };

  const actions = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={handleClose}
        disabled={isSubmitting}
      >
        {t("actions.cancel")}
      </button>
      <button 
        type="submit" 
        className="btn btn-primary" 
        onClick={handleSubmit}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? "Actualizando..." : t("actions.update")}
      </button>
    </>
  );

  if (isLoading) {
    return (
      <BaseModal
        isOpen={isOpen}
        isClosing={isClosing}
        onClose={handleClose}
        title={t("users:form.title.edit")}
        actions={actions}
        className="user-form-modal"
      >
        <div style={{ padding: "2rem", textAlign: "center" }}>
          Cargando datos del usuario...
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      title={t("users:form.title.edit")}
      actions={actions}
      className="user-form-modal"
    >
      <BaseForm onSubmit={handleSubmit}>
        <FormField 
          label={t("users:form.fields.name")} 
          required 
          error={errors.name}
        >
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            required
          />
        </FormField>

        <FormField 
          label={t("users:form.fields.email")} 
          required 
          error={errors.email}
        >
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            required
          />
        </FormField>

        <PasswordField
          label={t("users:form.fields.newPassword")}
          value={formData.password}
          onChange={handlePasswordChange}
          required={false}
          showValidation={false}
          error={errors.password}
        />
        <div className="password-help-text">
          {t("users:form.fields.newPasswordExtraInfo")}
        </div>

        <SelectField
          label={t("users:form.fields.locale")}
          value={formData.locale}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, locale: String(value) }));
            if (errors.locale) setErrors((prev) => ({ ...prev, locale: "" }));
          }}
          options={[
            { value: "", label: t("users:form.fields.labelWithoutLang") },
            { value: "es", label: t("lang:es") },
            { value: "en", label: t("lang:en") },
            { value: "fr", label: t("lang:fr") },
          ]}
          required={false}
          placeholder={t("users:form.fields.selectLanguage")}
          error={errors.locale}
        />

        <BooleanSelectField
          label={t("users:form.fields.isActive")}
          value={formData.isActive}
          onChange={(value) => setFormData((prev) => ({ ...prev, isActive: value }))}
          trueLabel={t("users:form.fields.isActiveTrue")}
          falseLabel={t("users:form.fields.isActiveFalse")}
          required
        />

        <MultiSelectField
          label={t("users:form.fields.sites")}
          selectedValues={formData.selectedSites}
          onChange={(selectedSites) => setFormData((prev) => ({ ...prev, selectedSites }))}
          options={sites.map(site => ({
            value: site.siteId,
            label: site.siteName
          }))}
          placeholder={loadingSites ? t("users:form.fields.sitesCharge") : undefined}
          size={8}
        />

        <div className="permissions-group">
          <h4>{t("users:form.fields.permissions")}</h4>

          <CheckboxField
            label={t("users:form.fields.isCustomer")}
            checked={formData.isCustomer}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isCustomer: checked }))}
          />
          
          <CheckboxField
            label={t("users:form.fields.isAdmin")}
            checked={formData.isAdmin}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isAdmin: checked }))}
          />
          
          <CheckboxField
            label={t("users:form.fields.isCB")}
            checked={formData.isCB}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isCB: checked }))}
          />
          
          <CheckboxField
            label={t("users:form.fields.isList")}
            checked={formData.isList}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isList: checked }))}
          />
          
          <CheckboxField
            label={t("users:form.fields.isDailyOrdersReport")}
            checked={formData.isDailyOrdersReport}
            onChange={(checked) => setFormData((prev) => ({ ...prev, isDailyOrdersReport: checked }))}
          />
        </div>
      </BaseForm>
    </BaseModal>
  );
};