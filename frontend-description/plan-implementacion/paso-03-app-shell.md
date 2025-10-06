# Paso 3. App shell y navegación principal

**Objetivo:** Construir la estructura persistente de la aplicación que unifica la experiencia de usuario.

## Actividades principales
- Implementar layout con header, sidebar y área de contenido siguiendo `frontend-architecture.md`.
- Conectar el selector de fecha de cálculo al servicio (`GET/POST /api/fecha-calculo`) y almacenar el valor en el store global.
- Configurar React Router v6 con rutas anidadas que sigan la jerarquía descrita en `system-overview.md`.
- Crear componentes reutilizables de breadcrumbs, toasts y contenedores de página basados en Material UI.
- Definir la estructura de permisos y estados vacíos comunes.

## Entregables
- App shell funcional con navegación entre rutas mock.
- Selector de fecha de cálculo sincronizado y visible en el header.
- Sistema de notificaciones y breadcrumbs reutilizable.

## Criterios de aceptación
- El layout responde correctamente en resoluciones desktop y tablet.
- El cambio de fecha de cálculo dispara eventos o invalidaciones de React Query.
- El menú lateral resalta la ruta activa y permite colapsar/expandir.
