---
sidebar_position: 9
slug: /devs-backend/chatbot
---

# Integración futura con chatbot

GesPack está preparado para integrar un chatbot basado en OpenAI para ayudar a los usuarios y desarrolladores.

## Estrategia de integración
- El frontend incluirá un componente de chat accesible desde cualquier página.
- El backend podrá exponer endpoints para preguntas frecuentes y ayuda contextual.
- El bot podrá consultar la documentación y guiar al usuario en tiempo real.

## Ejemplo de API para el bot
```typescript
// src/chatbot/chatbot.controller.ts
@Controller('chatbot')
export class ChatbotController {
  @Post('ask')
  async ask(@Body() question: string) {
    // lógica para consultar OpenAI y responder
  }
}
```

## Ventajas
- Ayuda interactiva y contextual.
- Reducción de tickets de soporte.
- Mejor onboarding para nuevos usuarios y devs.

---

Fin de la guía backend. Continúa con la [guía frontend](../devs-frontend/arquitectura).
