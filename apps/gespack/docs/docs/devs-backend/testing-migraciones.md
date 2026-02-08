---
sidebar_position: 6
slug: /devs-backend/testing-migraciones
---

# Testing y migraciones

## Testing
- Usa Jest para pruebas unitarias y de integración.
- Los tests se ubican en la carpeta correspondiente a cada módulo (`orders/__tests__`, etc).
- Ejecuta los tests con:

```bash
pnpm test
```

## Migraciones
- TypeORM gestiona las migraciones de la base de datos.
- Las migraciones se ubican en `src/migrations/`.
- Para crear una migración:

```bash
pnpm typeorm migration:generate -n NombreMigracion
```

- Para ejecutar migraciones:

```bash
pnpm typeorm migration:run
```

---

Siguiente: [Despliegue y Docker](./despliegue-docker)
