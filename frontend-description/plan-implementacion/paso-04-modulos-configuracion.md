# Paso 4. Módulos de configuración y catálogos

**Objetivo:** Implementar los módulos base que alimentan catálogos y parámetros esenciales para el resto del sistema.

## Artefactos de referencia

- Reglas generales de catálogos: [`frontend-description/catalogos.md`](../catalogos.md).
- Detalle por catálogo: `actividades.md`, `empleados.md`, `centros-asignaciones.md`, `centro-produccion.md`, `centro-apoyo.md`, `asignacion-centro.md`, `fecha-calculo.md`.
- Comportamiento de auditoría y estados: [`frontend-description/asientos-control.md`](../asientos-control.md).
- Guía de formularios y validaciones: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md).

## Checklist operativo

1. **Estructura de rutas y permisos**
   - Crear submódulo `src/modules/configuracion` con rutas para cada catálogo priorizado.
   - Configurar navegación secundaria y breadcrumbs específicos del módulo.
   - Asociar permisos (`catalogos.read`, `catalogos.write`) y estados de solo lectura según roles documentados.

2. **Componentes reutilizables**
   - Implementar `FormSection`, `FormActions`, `CatalogTable` y `CatalogFilterBar` siguiendo las guías de UI.
   - Integrar `react-hook-form` + `zod` para validaciones declarativas y mensajes localizados.
   - Añadir `EntityStatusBadge` para mostrar estados (Activo, Inactivo, Sincronizando) basados en `catalogos.md`.

3. **Integración con API**
   - Crear hooks `useActividades`, `useEmpleados`, `useCentros`, etc., empleando TanStack Query para cache y revalidación.
   - Implementar mutaciones (`create`, `update`, `delete`) con estados optimistas y manejo de errores detallado.
   - Registrar auditoría (`createdBy`, `updatedAt`) en columnas de tabla y modales de detalle.

4. **Sincronizaciones y dependencias**
   - Activar banners informativos cuando existan sincronizaciones en curso (`catalogos.md`, sección "Sincronización").
   - Asegurar que la edición de catálogos invalide caches dependientes (por ejemplo, Actividades afecta Consumos y Producción).
   - Documentar triggers automáticos en `src/modules/configuracion/README.md` para consumo de otros equipos.

5. **Pruebas y documentación**
   - Crear pruebas unitarias para hooks (`useActividades`) y componentes (formularios, tablas) cubriendo estados de error.
   - Registrar historias en Storybook o MDX para componentes de formulario/tabla.
   - Actualizar tablero con métricas de cobertura y deuda técnica identificada.

## Entregables

- Rutas de Configuración operativas con datos provenientes de los endpoints reales.
- Componentes de formulario, tabla y banners reutilizables documentados y versionados.
- Hooks de datos (`useActividades`, `useEmpleados`, etc.) con estados `loading`, `error` y `sync` gestionados.

## Criterios de aceptación

- Operaciones CRUD muestran toasts, deshabilitan acciones durante requests y registran auditoría visible.
- Los catálogos se almacenan en cache, se invalidan tras mutaciones y respetan dependencias entre módulos.
- Existe documentación breve de componentes compartidos en Storybook o MDX con ejemplos de uso y props obligatorias.
