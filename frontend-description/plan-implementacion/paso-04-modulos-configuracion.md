# Paso 4. Módulos de configuración y catálogos

**Objetivo:** Implementar los módulos base que alimentan catálogos y parámetros esenciales para el resto del sistema.

## Artefactos de referencia

- Reglas generales de catálogos: [`frontend-description/catalogos.md`](../catalogos.md).
- Detalle por catálogo: `actividades.md`, `empleados.md`, `centros-asignaciones.md`, `centro-produccion.md`, `centro-apoyo.md`, `asignacion-centro.md`, `fecha-calculo.md`.
- Comportamiento de auditoría y estados: [`frontend-description/asientos-control.md`](../asientos-control.md).
- Guía de formularios y validaciones: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md).

## Checklist operativo

1. **Estructura de rutas y permisos**
   - Crear submódulo `src/modules/configuracion` con rutas para cada catálogo priorizado e indexar los módulos hijos (`actividades`, `empleados`, `centros`, `parametros-generales`).
   - Configurar navegación secundaria y breadcrumbs específicos del módulo, enlazando con la metadata definida en el paso 3 (`src/app/routes.tsx`).
   - Asociar permisos (`catalogos.read`, `catalogos.write`) y estados de solo lectura según roles documentados, incluyendo reglas para perfiles externos que solo pueden visualizar auditoría.
   - Definir guardas adicionales (`featureFlags`) para catálogos opcionales, habilitando despliegues graduales sin romper la jerarquía de rutas.

2. **Componentes reutilizables**
   - Implementar `FormSection`, `FormActions`, `CatalogTable` y `CatalogFilterBar` siguiendo las guías de UI, cuidando la accesibilidad (labels asociados, atajos de teclado documentados en UI guidelines).
   - Integrar `react-hook-form` + `zod` para validaciones declarativas y mensajes localizados, centralizando esquemas en `src/modules/configuracion/schemas` para reutilizarlos entre formularios y pruebas.
   - Añadir `EntityStatusBadge` para mostrar estados (Activo, Inactivo, Sincronizando) basados en `catalogos.md`, con soporte para tooltips que muestren la causa del último cambio de estado.
   - Documentar en Storybook cada componente compartido con historias de estados base/edición/error, habilitando controles para props obligatorias.

3. **Integración con API**
   - Crear hooks `useActividades`, `useEmpleados`, `useCentros`, etc., empleando TanStack Query para cache y revalidación, encapsulando la paginación y filtros comunes.
   - Implementar mutaciones (`create`, `update`, `delete`) con estados optimistas y manejo de errores detallado; incluir rollback en caso de error y feedback en toasts diferenciando errores de validación vs. de servidor.
   - Registrar auditoría (`createdBy`, `updatedAt`) en columnas de tabla y modales de detalle, permitiendo ordenar/filtrar por usuario responsable y fecha.
   - Instrumentar logging en `src/lib/observability` para rastrear llamadas fallidas y correlacionarlas con el ID de sincronización del backend.

4. **Sincronizaciones y dependencias**
   - Activar banners informativos cuando existan sincronizaciones en curso (`catalogos.md`, sección "Sincronización"), indicando el tiempo estimado restante y el alcance (catálogo afectado, módulos dependientes).
   - Asegurar que la edición de catálogos invalide caches dependientes (por ejemplo, Actividades afecta Consumos y Producción) mediante `queryClient.invalidateQueries` y eventos en el store global.
   - Documentar triggers automáticos en `src/modules/configuracion/README.md` para consumo de otros equipos, incluyendo diagramas de secuencia sencillos de sincronización.
   - Coordinar con el backend una bandera `syncStatus` en cada endpoint para mostrar mensajes preventivos antes de permitir la edición.

5. **Pruebas y documentación**
   - Crear pruebas unitarias para hooks (`useActividades`) y componentes (formularios, tablas) cubriendo estados de error y sincronización en curso.
   - Registrar historias en Storybook o MDX para componentes de formulario/tabla, incluyendo variaciones con catálogos vacíos y datos masivos.
   - Actualizar tablero con métricas de cobertura y deuda técnica identificada, priorizando tareas de refactor cuando aparezcan patrones duplicados en catálogos.
   - Preparar documentación funcional en Confluence/Notion detallando flujos de aprobación, dependencias y ejemplos de payloads.

## Dependencias con los pasos anteriores (01-03)

- **Del Paso 1 (Preparativos):** Validar con negocio los catálogos que entran en la primera oleada y documentar owners funcionales para agilizar revisiones y aprobaciones.
- **Del Paso 2 (Configuración técnica inicial):** Reutilizar el tema, providers globales, cliente HTTP y tooling de lint/pruebas para garantizar consistencia y detectar errores temprano.
- **Del Paso 3 (App shell):** Conectar la navegación secundaria de Configuración al árbol principal de rutas, aprovechar el selector de fecha de cálculo y los componentes de feedback (toasts, estados vacíos) ya disponibles.
- Mantener sincronizados los permisos definidos en el store global y en el backend, documentando cualquier desviación o feature flag para QA.

## Métricas y seguimiento sugerido

- **Cobertura de pruebas:** Mantener ≥70% en hooks y componentes críticos (`CatalogTable`, formularios de alta/edición).
- **Performance:** Medir tiempos de carga de catálogos (TTFB, tiempo hasta renderizado) y asegurar <1.5s para listados paginados estándar.
- **Auditoría:** Verificar que el 100% de las operaciones registren `createdBy`, `updatedBy`, `updatedAt` y estado previo.
- **Adopción:** Registrar en el tablero la cantidad de catálogos migrados y las incidencias abiertas/cerradas por sprint para ajustar la planificación del Paso 5.

## Entregables

- Rutas de Configuración operativas con datos provenientes de los endpoints reales y controles de permisos activos.
- Componentes de formulario, tabla y banners reutilizables documentados y versionados con notas de accesibilidad.
- Hooks de datos (`useActividades`, `useEmpleados`, etc.) con estados `loading`, `error` y `sync` gestionados e integrados a auditoría.
- README del módulo con triggers, dependencias y guía rápida de troubleshooting compartido con QA y backend.

## Criterios de aceptación

- Operaciones CRUD muestran toasts, deshabilitan acciones durante requests y registran auditoría visible, incluyendo causa y usuario del último cambio.
- Los catálogos se almacenan en cache, se invalidan tras mutaciones y respetan dependencias entre módulos, reflejándose en actualizaciones automáticas de formularios que consumen dichos datos.
- Existe documentación breve de componentes compartidos en Storybook o MDX con ejemplos de uso y props obligatorias, vinculada desde el README del módulo.
- Los indicadores de sincronización y banners informativos se sincronizan correctamente con el backend y se ocultan cuando finaliza el proceso.
