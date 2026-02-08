// frontend/src/components/users/UsersList.tsx - ACTUALIZAR completamente
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "../shared/DataTable";
import { useUsersList } from "../../hooks/useUsersList";
import { FaUserPlus, FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import { useSetBreadcrumbActions } from "../../hooks/useBreadcrumbActions";
import { UserForm } from "./CreateUserForm";
import { EditUserForm } from "./EditUserForm";
import { updateUser } from "../../api/users";

export const UsersList: React.FC = () => {
  const { t } = useTranslation("users");
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false); // 👈 AÑADIR estado
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // 👈 AÑADIR estado
  const [dataTableKey, setDataTableKey] = useState(0);

  // 👈 AÑADIR función para manejar click en nombre
  const handleUserClick = (userId: number) => {
    setSelectedUserId(userId);
    setIsEditFormOpen(true);
  };

  const { columns, fetchPage } = useUsersList(handleUserClick); // 👈 PASAR callback

  const breadcrumbActions = useMemo(() => (
    <>
      <button className="btn btn-primary" onClick={() => setIsUserFormOpen(true)}>
        <FaUserPlus /> <span>{t("actions.addUser")}</span>
      </button>
      <button className="btn btn-secondary">
        <FaDownload /> <span>{t("actions.exportStats")}</span>
      </button>
      <button className="btn btn-tertiary">
        <FaCloudUploadAlt /> <span>{t("actions.import")}</span>
      </button>
    </>
  ), [t]);

  useSetBreadcrumbActions(breadcrumbActions);

  const handleUserSubmit = async () => {
    setDataTableKey(prev => prev + 1);
    setIsUserFormOpen(false);
  };

  // 👈 AÑADIR función para manejar actualización
  const handleUserUpdate = async (userData: any): Promise<void> => {
    try {
      await updateUser(selectedUserId!, userData);
      
      setDataTableKey(prev => prev + 1);
      setIsEditFormOpen(false);
      setSelectedUserId(null);
      alert(t("form.messages.success.update"));
    } catch (error: any) {
      devLog.error('Error updating user:', error);
      const errorMessage = error.message || t("form.messages.error.update");
      alert(errorMessage);
      throw error;
    }
  };

  return (
    <>
      <DataTable
        key={dataTableKey}
        columns={columns}
        fetchPage={fetchPage}
        initialLimit={10}
        initialFilters={{}}
      />

      <UserForm
        isOpen={isUserFormOpen}
        onClose={() => setIsUserFormOpen(false)}
        onSubmit={handleUserSubmit}
      />

      {/* 👈 AÑADIR EditUserForm */}
      <EditUserForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedUserId(null);
        }}
        onSubmit={handleUserUpdate}
        userId={selectedUserId}
      />
    </>
  );
};