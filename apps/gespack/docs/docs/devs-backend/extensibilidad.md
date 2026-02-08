---
sidebar_position: 8
slug: /devs-backend/extensibilidad
---

# Extensibilidad y nuevas features

GesPack está diseñado para ser modular y fácil de ampliar.

## Añadir una nueva feature
1. Crea una rama desde `develop`.
2. Añade el nuevo módulo en `src/` (por ejemplo, `src/informes/`).
3. Define las entidades y DTOs necesarios.
4. Implementa los servicios y controladores.
5. Añade tests y documentación.
6. Haz merge tras revisión de código.

## Ejemplo: Nuevo endpoint
```typescript
// src/informes/informes.controller.ts
@Controller('informes')
export class InformesController {
  @Get()
  getAll() {
    // lógica de informes
  }
}
```

## Buenas prácticas
- Mantén la estructura modular.
- Documenta cada nuevo módulo y endpoint.
- Añade traducciones si es necesario.

---

Siguiente: [Integración futura con chatbot](./chatbot)
