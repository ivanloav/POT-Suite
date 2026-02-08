---
sidebar_position: 2
slug: /devs-backend/estructura
---

# Estructura de carpetas del Backend

El backend de GesPack está organizado para facilitar la escalabilidad y el mantenimiento.

## Árbol de carpetas principal

```text
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   ├── dashboard/
│   ├── entities/
│   ├── generated/
│   ├── i18n/
│   ├── orders/
│   ├── shared/
│   ├── sites/
│   ├── users/
│   └── ...
├── docker-compose.yml
├── dockerfile
├── nest-cli.json
├── package.json
├── pnpm-lock.yaml
├── README.md
├── tsconfig.build.json
├── tsconfig.json
└── locales/
```

## Descripción de carpetas clave
- **auth/**: Autenticación y gestión de usuarios.
- **orders/**: Lógica de pedidos, DTOs, servicios y controladores.
- **entities/**: Definición de entidades TypeORM (tablas).
- **shared/**: Utilidades y tipos compartidos.
- **i18n/**: Internacionalización y traducciones.
- **sites/**: Gestión de sitios y configuración multi-site.
- **dashboard/**: Lógica de paneles y estadísticas.
- **generated/**: Código generado automáticamente.

## Ejemplo de archivo
```typescript
// src/orders/orders.service.ts
@Injectable()
export class OrdersService {
  // ... lógica de pedidos
}
```

---

Siguiente: [Entidades y DTOs](./entidades-dtos)
