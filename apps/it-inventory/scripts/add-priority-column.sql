-- Script para agregar columna priority a asset_maintenance_plans
-- Ejecutar en la base de datos it_inventory_db

-- Agregar columna priority con valor por defecto 'media'
ALTER TABLE asset_maintenance_plans 
ADD COLUMN priority VARCHAR(20) DEFAULT 'media';

-- Agregar índice para mejorar performance en filtros por prioridad
CREATE INDEX idx_asset_maintenance_plans_priority ON asset_maintenance_plans(priority);

-- Verificar que se agregó correctamente
SELECT column_name, data_type, character_maximum_length, column_default
FROM information_schema.columns
WHERE table_name = 'asset_maintenance_plans' 
  AND column_name = 'priority';
