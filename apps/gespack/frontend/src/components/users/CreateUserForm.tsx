import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../shared/BaseModal";
import { BaseForm, FormField, CheckboxField, BooleanSelectField, SelectField, MultiSelectField } from "../shared/BaseForm";
import { PasswordField } from "../shared/PasswordField";
import { createUser } from "../../api/users";
import { fetchAllSites, Site } from "../../api/sites";
import { devLog } from "../../utils/logger";
import { validateUserForm, validatePassword } from "../../utils/validation";
import "./CreateEditUserForm.css";

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: any) => void;
}

export const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation(["users", "lang"]);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false
  });

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

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (formData.password) {
      setPasswordValidation(validatePassword(formData.password));
    }
  }, [formData.password]);

  useEffect(() => {
    if (isOpen) {
      loadSites();
    }
  }, [isOpen]);

  // 👈 AÑADIR función para cargar sites
  const loadSites = async () => {
    try {
      setLoadingSites(true);
      const sitesList = await fetchAllSites();
      setSites(sitesList);
    } catch (error) {
      devLog.error('Error loading sites:', error);
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors = validateUserForm(formData, true);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        locale: formData.locale,
        selectedSites: formData.selectedSites,
        isCustomer: formData.isCustomer,
        isAdmin: formData.isAdmin,
        isActive: formData.isActive,
        isCB: formData.isCB,
        isList: formData.isList,
        isDailyOrdersReport: formData.isDailyOrdersReport,
      });

      onSubmit(newUser);
      alert(`Usuario "${newUser.userName}" creado correctamente con ${formData.selectedSites.length} sites asignados`);
      handleClose();
      resetForm();

    } catch (error: any) {
      devLog.error("Error creating user:", error);
      
      let errorMessage = "Error al crear el usuario";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Casos específicos de error
      if (errorMessage.includes('email') || errorMessage.includes('ya existe') || errorMessage.includes('already exists')) {
        setErrors({ email: errorMessage });
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
      resetForm();
    }, 400);
  };

  const resetForm = () => {
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
  };

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleEmailChange = (email: string) => {
    setFormData((prev) => ({ ...prev, email }));
    // Limpiar error de email si existe
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
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
        disabled={isSubmitting || (formData.password.trim().length > 0 && !passwordValidation.isValid)}
      >
        {isSubmitting ? "Guardando..." : t("actions.save")}
      </button>
    </>
  );

  if (!isOpen && !isClosing) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      isClosing={isClosing}
      onClose={handleClose}
      title={t("users:form.title.create")}
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
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />
        </FormField>

        <PasswordField
          label={t("users:form.fields.password")}
          value={formData.password}
          onChange={handlePasswordChange}
          required
          showValidation={true}
          alwaysShowValidation={true}
          onValidationChange={setPasswordValidation}
          className="user-form-password"
          error={errors.password}
        />
        
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
          placeholder={t("users:form.fields.selectLanguage")}
          error={errors.locale}
        />

        <BooleanSelectField
          label={t("users:form.fields.isActive")}
          value={formData.isActive}
          onChange={(value) => setFormData((prev) => ({ ...prev, isActive: value }))}
            className="user-form-input"
          trueLabel={t("users:form.fields.isActiveTrue")}
          falseLabel={t("users:form.fields.isActiveFalse")}
        />

        <MultiSelectField
          label={t("users:form.fields.sites")}
          selectedValues={formData.selectedSites}
          onChange={(selectedSites) => setFormData((prev) => ({ ...prev, selectedSites }))}
            className="user-form-input"
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