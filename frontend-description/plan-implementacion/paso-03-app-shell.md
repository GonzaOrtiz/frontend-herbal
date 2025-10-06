# Paso 3. App shell y navegación principal

**Objetivo:** Construir la estructura persistente de la aplicación que unifica la experiencia de usuario.

## Artefactos de referencia

- Diseño del layout y navegación: [`frontend-description/frontend-architecture.md`](../frontend-architecture.md).
- Jerarquía funcional de módulos: [`frontend-description/system-overview.md`](../system-overview.md).
- Detalle del servicio de fecha de cálculo: [`frontend-description/fecha-calculo.md`](../fecha-calculo.md) y `api-reference.md`.
- Lineamientos de estados vacíos y feedback: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md).

## Checklist operativo

1. **Estructura del layout**
   - Crear componentes `AppLayout`, `AppHeader`, `AppSidebar` y `AppContent` bajo `src/app/layout` siguiendo la arquitectura.
   - Implementar responsividad (sidebar colapsable en viewport < 1280px) usando `useMediaQuery` de MUI.
   - Incluir placeholders para avatar del usuario, selector de fecha y accesos rápidos definidos por negocio.

2. **Navegación y rutas base**
   - Configurar React Router v6 con rutas anidadas para cada dominio (Configuración, Operación diaria, Costos, Reportes).
   - Definir archivo `src/app/routes.tsx` que exporte un árbol de rutas con metadata (título, ícono, permisos requeridos).
   - Implementar breadcrumbs automáticos leyendo metadata de rutas y actualizándolos en el header.

3. **Selector de fecha de cálculo**
   - Crear hook `useCalculationDate` que integre TanStack Query con endpoints `GET/POST /api/fecha-calculo`.
   - Exponer el valor en el store global y sincronizarlo con el contexto de React Query (`queryClient.invalidateQueries`).
   - Manejar estados de carga/error con toasts y fallback a la última fecha válida guardada en localStorage si la API falla.

4. **Permisos y estados globales**
   - Definir estructura de permisos (`roles`, `scopes`) alineada a `system-overview` y documentos de módulos.
   - Implementar componente `<ProtectedRoute>` que valida permisos antes de renderizar la ruta hijo.
   - Crear componentes de estado vacío, cargando y error reutilizables (`EmptyState`, `ErrorState`, `LoadingOverlay`).

5. **Feedback y observabilidad**
   - Integrar sistema de toasts (`notistack` o `@mui/material/Snackbar`) con un hook `useToast` central.
   - Agregar logger de navegación para registrar ruta actual y fecha de cálculo activa (útil para analytics).
   - Configurar `ReactQueryDevtools` solo en entornos no productivos.

## Entregables

- App shell funcional con navegación entre rutas mock y layout responsivo.
- Selector de fecha de cálculo sincronizado con la API, el store y la UI.
- Sistema de notificaciones, breadcrumbs y estados globales reutilizable.

## Criterios de aceptación

- El layout responde correctamente en resoluciones desktop y tablet, manteniendo accesibilidad.
- El cambio de fecha de cálculo dispara invalidaciones de React Query y actualiza los módulos suscritos.
- El menú lateral resalta la ruta activa, permite colapsar/expandir y respeta los permisos configurados.
