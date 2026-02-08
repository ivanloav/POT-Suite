---
sidebar_position: 5
slug: /devs-backend/auth-permisos
---

# Autenticación y permisos

GesPack utiliza JWT para la autenticación y roles para la gestión de permisos.

## Flujo de autenticación
1. El usuario inicia sesión y recibe un token JWT.
2. El token se almacena en el frontend y se envía en cada petición.
3. El backend valida el token y extrae el usuario y sus permisos.

## Ejemplo de guardia de autenticación
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization'];
    // Validar token y permisos
    return !!token;
  }
}
```

## Roles y permisos
- Los roles se asignan por usuario y sitio.
- Los permisos determinan qué acciones puede realizar cada usuario.
- Se pueden definir roles personalizados en la entidad `User` y en la configuración de sitios.

---

Siguiente: [Testing y migraciones](./testing-migraciones)
