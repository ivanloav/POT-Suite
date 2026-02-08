---
title: Guía del Dashboard
sidebar_label: Dashboard
---

# Guía del Dashboard

El Dashboard es la página principal del sistema IT Inventory que proporciona una vista rápida del estado general de los activos y métricas clave.

## 📊 Acceso al Dashboard

El Dashboard es la primera página que verás al iniciar sesión. También puedes acceder desde:

1. **Menú lateral:** Clic en "Dashboard" (icono de inicio)
2. **URL directa:** `http://localhost:5173/`
3. **Logo del sistema:** Clic en el logo superior izquierdo

---

## 🎯 Métricas Principales

El Dashboard muestra **4 tarjetas de métricas** con información en tiempo real:

### 1. Total Activos

![Icono: Caja azul]

**Descripción:** Número total de activos registrados en el site seleccionado.

**Cálculo:** Suma de todos los activos sin importar su estado.

**Ejemplos:**
- 150 activos totales = 120 laptops + 20 desktops + 10 servidores
- Incluye activos disponibles, asignados, en reparación y retirados

**Uso:**
- Monitorear crecimiento del inventario
- Validar completitud de registros
- Reportes mensuales

---

### 2. En Stock

![Icono: Paquete verde]

**Descripción:** Activos disponibles para asignación.

**Filtro:** Solo activos con estado `code = 'in_stock'` (Disponible).

**Ejemplos:**
- 25 laptops nuevas sin asignar
- 10 desktops de reemplazo en almacén
- 5 tablets disponibles para proyectos

**Uso:**
- Planificación de nuevas contrataciones
- Control de stock para compras
- Disponibilidad para reasignaciones

**Color:** Verde (indica disponibilidad)

---

### 3. Asignados

![Icono: Triángulo amarillo con exclamación]

**Descripción:** Activos actualmente en uso por empleados.

**Filtro:** Activos con estado `code = 'assigned'` (Asignado).

**Ejemplos:**
- 80 laptops asignadas a desarrolladores
- 15 desktops en oficina administrativa
- 3 tablets para equipo de ventas

**Uso:**
- Monitorear nivel de utilización
- Identificar activos en producción
- Validar asignaciones activas

**Color:** Amarillo (indica en uso, requiere seguimiento)

---

### 4. Retirados

![Icono: Archivo rojo]

**Descripción:** Activos dados de baja o fuera de servicio.

**Filtro:** Activos con estado `code = 'retired'` (Retirado).

**Ejemplos:**
- 10 laptops obsoletas (más de 5 años)
- 5 desktops con fallas irreparables
- 2 servidores reemplazados

**Uso:**
- Control de obsolescencia
- Planificación de renovación de equipos
- Auditoría de bajas

**Color:** Rojo (indica fuera de servicio)

---

## 🏢 Selector de Site

El Dashboard muestra datos **filtrados por el site seleccionado** en el selector superior derecho.

### Cambiar de Site

1. Clic en el selector de site (esquina superior derecha)
2. Selecciona el site deseado de la lista desplegable
3. El Dashboard se actualiza automáticamente

**Ejemplo:**
- Site Madrid: 120 activos
- Site Barcelona: 80 activos
- Site Valencia: 50 activos

### Comportamiento Multi-Site

- **Rol Admin:** Ve selector con todos los sites del sistema
- **Rol IT/Viewer:** Solo ve sites asignados a su usuario
- **Cambio persistente:** El site seleccionado se guarda y mantiene en todas las páginas

---

## 📈 Interpretación de Métricas

### Ratio de Utilización

```
Utilización = (Asignados / Total Activos) × 100
```

**Ejemplo:**
- Total: 150 activos
- Asignados: 80 activos
- **Utilización: 53.3%**

**Interpretación:**
- &lt;40%: Sobrecapacidad (considerar reasignar o donar)
- 40-70%: Balance saludable
- 70-90%: Alta utilización (considerar stock de seguridad)
- &gt;90%: Riesgo de escasez (planificar compras)

---

### Ratio de Disponibilidad

```
Disponibilidad = (En Stock / Total Activos) × 100
```

**Ejemplo:**
- Total: 150 activos
- En Stock: 25 activos
- **Disponibilidad: 16.7%**

**Interpretación:**
- &lt;10%: Bajo stock (compras urgentes)
- 10-20%: Stock mínimo (monitorear)
- 20-30%: Stock saludable
- &gt;30%: Sobrecapacidad (puede indicar subutilización)

---

### Tasa de Retiro

```
Tasa de Retiro = (Retirados / Total Activos) × 100
```

**Ejemplo:**
- Total: 150 activos
- Retirados: 10 activos
- **Tasa de Retiro: 6.7%**

**Interpretación:**
- &lt;5%: Flota moderna
- 5-10%: Normal (reemplazo gradual)
- 10-15%: Renovación en curso
- &gt;15%: Alta obsolescencia (revisar política de reemplazo)

---

## 🎨 Visualización

### Colores de Tarjetas

Las tarjetas usan colores semánticos para facilitar interpretación rápida:

| Métrica | Color | Significado |
|---------|-------|-------------|
| Total Activos | Azul | Información general |
| En Stock | Verde | Disponible/Positivo |
| Asignados | Amarillo | En uso/Requiere seguimiento |
| Retirados | Rojo | Fuera de servicio/Atención |

---

### Iconografía

- **Box (Caja):** Representa el inventario total
- **Package (Paquete):** Indica stock disponible
- **AlertTriangle (Triángulo):** Alerta de activos en uso
- **Archive (Archivo):** Activos archivados/retirados

---

## 🔄 Actualización de Datos

### Frecuencia de Actualización

- **Automática:** Cada vez que cambias de site
- **Manual:** Recarga la página (F5) para datos más recientes
- **Caché:** React Query cachea datos por 5 minutos

### Sincronización

Las métricas reflejan:
- ✅ Activos creados/editados
- ✅ Cambios de estado de activos
- ✅ Asignaciones creadas
- ✅ Devoluciones de activos
- ✅ Activos retirados

**Nota:** Si realizas cambios en otra pestaña, recarga el Dashboard para ver actualizaciones.

---

## 🚀 Acciones Rápidas

Desde el Dashboard puedes navegar rápidamente a:

### 1. Ver Activos Disponibles

1. Observa el número en la tarjeta "En Stock"
2. Navega a **Activos** (menú lateral)
3. Filtra por estado "Disponible"

### 2. Revisar Asignaciones

1. Observa el número en la tarjeta "Asignados"
2. Navega a **Asignaciones** (menú lateral)
3. Filtra por estado "Activa"

### 3. Analizar Activos Retirados

1. Observa el número en la tarjeta "Retirados"
2. Navega a **Activos**
3. Filtra por estado "Retirado"
4. Exporta lista para análisis de obsolescencia

---

## 📊 Casos de Uso Comunes

### Caso 1: Planificación de Nueva Contratación

**Escenario:** Se contratan 5 desarrolladores nuevos la próxima semana.

**Pasos:**
1. Abre Dashboard
2. Verifica tarjeta "En Stock"
3. Si &lt; 5 laptops disponibles → Crear solicitud de compra
4. Si ≥ 5 laptops → Navegar a Asignaciones y asignar equipos

---

### Caso 2: Auditoría Mensual

**Escenario:** Reporte mensual de inventario para dirección.

**Pasos:**
1. Captura screenshot del Dashboard
2. Calcula ratios (utilización, disponibilidad, retiro)
3. Compara con mes anterior
4. Identifica tendencias:
   - ¿Aumentó el total de activos?
   - ¿Bajó el stock disponible?
   - ¿Incrementó la tasa de retiro?

---

### Caso 3: Solicitud de Presupuesto

**Escenario:** Justificar compra de 20 laptops nuevas.

**Pasos:**
1. Dashboard muestra:
   - Total: 150 activos
   - En Stock: 3 laptops
   - Asignados: 130 laptops
2. Argumentos:
   - Disponibilidad crítica (2%)
   - Alta utilización (86.7%)
   - Necesidad de stock de seguridad (10-15% recomendado)
3. Solicitud: 20 laptops para alcanzar 15% disponibilidad

---

### Caso 4: Renovación de Equipos Obsoletos

**Escenario:** Presupuesto anual para reemplazo de equipos.

**Pasos:**
1. Dashboard muestra:
   - Retirados: 15 activos (10%)
2. Navegar a Activos → Filtrar por:
   - Fecha de compra &lt; 2019 (más de 5 años)
3. Identificar activos en riesgo de falla
4. Planificar reemplazo gradual:
   - Q1: 10 laptops
   - Q2: 8 desktops
   - Q3: 5 laptops
   - Q4: 7 desktops

---

## 🎯 Mejores Prácticas

### 1. Revisar Dashboard Diariamente

- **Mañana:** Primer vistazo del día para identificar anomalías
- **Tarde:** Validar cambios realizados durante el día

---

### 2. Mantener Ratios Saludables

**Objetivos recomendados:**
- **Disponibilidad:** 10-20% del total
- **Utilización:** 60-80% del total
- **Tasa de Retiro:** &lt;10% del total

---

### 3. Documentar Tendencias

Lleva registro mensual en Excel:

| Mes | Total | En Stock | Asignados | Retirados | Utilización |
|-----|-------|----------|-----------|-----------|-------------|
| Ene | 150 | 25 | 115 | 10 | 76.7% |
| Feb | 155 | 20 | 120 | 15 | 77.4% |
| Mar | 160 | 15 | 130 | 15 | 81.3% |

**Análisis:**
- Tendencia creciente de utilización
- Stock disponible en descenso
- Necesidad de compra próxima

---

### 4. Comparar entre Sites

Si administras múltiples sites, compara métricas:

| Site | Total | Disponibilidad | Utilización |
|------|-------|----------------|-------------|
| Madrid | 150 | 16.7% | 76.7% |
| Barcelona | 80 | 12.5% | 85.0% |
| Valencia | 50 | 24.0% | 70.0% |

**Insights:**
- Barcelona necesita stock urgente (12.5%)
- Valencia tiene exceso de capacidad (24%)
- **Acción:** Reasignar 3-4 laptops de Valencia a Barcelona

---

## 🔒 Permisos y Acceso

### Roles y Visualización

| Rol | Acceso Dashboard | Sites Visibles |
|-----|------------------|----------------|
| Admin | ✅ Completo | Todos |
| IT | ✅ Completo | Asignados al usuario |
| Viewer | ✅ Solo lectura | Asignados al usuario |

### Restricciones

- **Viewer:** No puede crear/editar activos desde Dashboard (solo visualizar)
- **IT:** Puede realizar acciones en sites asignados
- **Admin:** Sin restricciones

---

## 🛠️ Solución de Problemas

### Problema 1: Métricas en Cero

**Síntoma:** Todas las tarjetas muestran "0".

**Causas posibles:**
1. Site seleccionado sin activos registrados
2. Error de conexión con backend
3. Sin permisos de lectura

**Solución:**
1. Verificar selector de site
2. Comprobar conexión a internet
3. Recargar página (F5)
4. Contactar administrador si persiste

---

### Problema 2: Datos Desactualizados

**Síntoma:** Dashboard no refleja cambios recientes.

**Solución:**
1. Forzar recarga: `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac)
2. Limpiar caché del navegador
3. Cerrar sesión y volver a iniciar

---

### Problema 3: Números Inconsistentes

**Síntoma:** Total ≠ En Stock + Asignados + Retirados

**Causa:** Existen activos con otros estados (En Reparación, En Tránsito, etc.)

**Solución:**
1. Navegar a Activos
2. Filtrar por todos los estados
3. Verificar distribución completa
4. Es comportamiento esperado (no todos los estados se muestran en Dashboard)

---

## 📱 Responsividad

El Dashboard se adapta a diferentes tamaños de pantalla:

### Desktop (&gt;1024px)
- 4 columnas de tarjetas
- Métricas lado a lado

### Tablet (768px-1024px)
- 2 columnas de tarjetas
- Vista compacta

### Mobile (&lt;768px)
- 1 columna vertical
- Tarjetas apiladas
- Scroll vertical

---

## 🔮 Futuras Mejoras (Roadmap)

Funcionalidades planeadas para próximas versiones:

### 1. Gráficos de Tendencias

- Línea de tiempo de crecimiento de inventario
- Evolución mensual de asignaciones
- Curva de retiros por edad

### 2. Métricas Adicionales

- En Reparación
- En Tránsito
- Garantía próxima a vencer
- Valor total del inventario

### 3. Alertas Visuales

- Badge rojo si disponibilidad &lt;10%
- Alerta amarilla si utilización &gt;90%
- Notificación de garantías venciendo

### 4. Comparación Temporal

- "Cambio vs. mes anterior: +5%"
- Tendencia: ↑↓→

### 5. Acciones Rápidas

- Botón "Asignar Activo" desde Dashboard
- Link directo a "Activos Disponibles"
- Crear asignación rápida

---

## 📖 Recursos Relacionados

- [Guía de Activos](./assets-guide.md) - Gestión completa de activos
- [Guía de Asignaciones](./assignments-guide.md) - Asignación de activos
- [Guía de Estados](./catalogs-guide.md#estados-de-activos) - Todos los estados disponibles
- [Multi-Site Architecture](../it/multi-site-architecture.md) - Funcionamiento del selector de sites
