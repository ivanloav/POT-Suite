-- Migración: Cambiar card_number de BIGINT a TEXT en order_payments
-- Fecha: 2025-11-10
-- Motivo: Los números de tarjeta exceden el rango seguro de Number en JavaScript

ALTER TABLE order_payments 
ALTER COLUMN card_number TYPE TEXT 
USING card_number::TEXT;

-- Verificar el cambio
\d order_payments;
