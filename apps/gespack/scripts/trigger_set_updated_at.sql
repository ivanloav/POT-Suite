-- Función genérica para actualizar updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas las tablas relevantes
-- Ejemplo para tabla: users
-- Repite para cada tabla que tenga updated_at
--
-- CREATE TRIGGER trg_users_set_updated_at
-- BEFORE UPDATE ON users
-- FOR EACH ROW
-- EXECUTE FUNCTION set_updated_at();

-- Triggers para tablas principales (ejemplo, repite para cada tabla con updated_at)
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_brands_set_updated_at
BEFORE UPDATE ON brands
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_action_categories_set_updated_at
BEFORE UPDATE ON action_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_action_priority_types_set_updated_at
BEFORE UPDATE ON action_priority_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_action_category_costs_set_updated_at
BEFORE UPDATE ON action_category_costs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_actions_set_updated_at
BEFORE UPDATE ON actions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_marked_types_set_updated_at
BEFORE UPDATE ON customer_marked_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_rnvp_types_set_updated_at
BEFORE UPDATE ON customer_rnvp_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_types_set_updated_at
BEFORE UPDATE ON customer_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customers_set_updated_at
BEFORE UPDATE ON customers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_customer_marked_set_updated_at
BEFORE UPDATE ON customer_marked
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_substitutes_set_updated_at
BEFORE UPDATE ON product_substitutes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_set_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_bundles_set_updated_at
BEFORE UPDATE ON product_bundles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_payments_card_types_set_updated_at
BEFORE UPDATE ON order_payments_card_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_payments_set_updated_at
BEFORE UPDATE ON order_payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_payment_schedules_set_updated_at
BEFORE UPDATE ON order_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_sources_set_updated_at
BEFORE UPDATE ON order_sources
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_set_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_addresses_set_updated_at
BEFORE UPDATE ON order_addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_items_set_updated_at
BEFORE UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_order_item_substitutes_set_updated_at
BEFORE UPDATE ON order_item_substitutes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_packaging_set_updated_at
BEFORE UPDATE ON packaging
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_packaging_sites_set_updated_at
BEFORE UPDATE ON packaging_sites
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_returns_set_updated_at
BEFORE UPDATE ON returns
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_return_items_set_updated_at
BEFORE UPDATE ON return_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
