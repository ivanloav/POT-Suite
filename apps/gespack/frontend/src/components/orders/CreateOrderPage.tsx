import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateOrderForm } from "./CreateOrderForm";
import { createOrder } from "../../api/orders";
import { notify } from "../../utils/notifications";
import { useTranslation } from "react-i18next";
import { useLastOrderReference } from "../../hooks/useLastOrderReference";
import { devLog } from "../../utils/logger";

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation("order");
  const { searchLastOrderReference } = useLastOrderReference();

  const handleSubmit = async (orderData: any) => {
    setIsSubmitting(true);
    try {
      const response = await createOrder(orderData);
      
      // Mostrar notificación de éxito
      //notify.success(t("orderForm.notify.createSuccess") || "Pedido creado exitosamente");
      
      // Refrescar el último número de pedido para el breadcrumb
      searchLastOrderReference();
      
      // Redirigir a la lista de pedidos
      navigate("/user/orders");
      
      return response.data; // Retornar la respuesta para que el padre pueda usarla
    } catch (error) {
      devLog.error("Error al crear pedido:", error);
      
      // Mostrar notificación de error
      notify.error(t("orderForm.notify.createError") || "Error al crear el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateOrderForm
      isOpen={true}
      onClose={() => navigate("/user/orders")}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};