# Paso 5. Operación diaria y procesos transaccionales

**Objetivo:** Cubrir los flujos diarios de captura, validación y cierre operativo (Consumos, Producciones, Litros, Pérdidas, Sobrantes) asegurando trazabilidad y sincronización con módulos dependientes.

## Artefactos de referencia

- Detalle de procesos y campos obligatorios: `consumos.md`, `producciones.md`, `litros-crema.md`, `perdidas.md`, `sobrantes.md`.
- Reglas de importación, catálogos relacionados y bitácoras: [`frontend-description/importacion.md`](../importacion.md), `catalogos.md`.
- Historias de usuario y asignaciones: `asignacion-actividad-empleado.md`, `asignacion-historial.md`, `centros-asignaciones.md`.
- Parámetros transaccionales y cálculos: `consumos.md` (sección de cálculos), `produccion-crema.md`, `existencias.md`.
- Lineamientos de UI y accesibilidad: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md), `frontend-architecture.md`.

## Checklist operativo

1. **Flujos, filtros y contexto**
   - Reutilizar el selector global de fecha de cálculo y producto (Paso 3) con la capacidad de fijar un rango corto (día actual, anterior, semana móvil) y restaurarlo desde `localStorage`.
   - Mapear dependencias de filtros por módulo (Consumos requiere `centro` + `actividad`, Producción requiere `orden`, Litros usa `lote` + `turno`) y documentar estados default.
   - Exponer resumen contextual en el encabezado (fecha bloqueada, centro activo, responsable asignado) con datos provenientes de `asignacion-actividad-empleado.md`.
   - Habilitar vistas guardadas por rol (`coordinador`, `analista`, `auditor`) con persistencia y opción de compartir enlaces profundos (`deep-links`).

2. **Tablas, formularios y edición**
   - Construir tablas densas con `MUI Data Grid` con virtualización activada (`experimentalFeatures={{ columnGrouping: true }}`) y agrupaciones por lote/turno cuando lo defina el proceso.
   - Definir modos de edición inline vs. modal según el riesgo del dato (ej. consumos menores inline, pérdidas mayores en modal con firmas digitales si aplica).
   - Añadir columnas de trazabilidad (`createdBy`, `source`, `syncStatus`, `lastImportedAt`) y tooltips con motivo del último cambio.
   - Implementar acciones masivas (`aprobar`, `recalcular`, `cerrar turno`) con panel lateral que muestre impacto en existencias y métricas de producción.
   - Prevenir inconsistencias aplicando reglas de negocio en cliente antes de enviar (por ejemplo, consumos no pueden exceder producción asociada; pérdidas requieren justificación mínima de 20 caracteres).

3. **Importaciones y validaciones**
   - Implementar `BulkUploadDialog` con arrastre, validación `zod` por módulo (esquemas en `src/modules/operacion/schemas`), previsualización de filas y barra de progreso real.
   - Registrar bitácoras descargables (`.csv` y `.json`) con resumen de errores agrupados por tipo, usuario y timestamp, y permitir reintentos parciales con `resumeToken` descrito en `importacion.md`.
   - Mostrar estado de importación en tiempo real (`processing`, `waiting`, `completed`, `failed`) mediante `ProgressPanel` reutilizable y notificaciones toast persistentes.
   - Autocompletar formularios con valores provenientes de importaciones exitosas para facilitar ediciones posteriores.

4. **Integraciones, sincronización y reglas de cierre**
   - Configurar polling o WebSockets (dependiendo del backend) para reflejar cambios generados por procesos automáticos (por ejemplo, recalculo nocturno de consumos, cierres contables) y forzar `queryClient.invalidateQueries` en módulos dependientes (`existencias`, `costos`).
   - Integrar los eventos de Producción con las actualizaciones de Existencias y Costos consolidando la lógica en `src/modules/operacion/hooks/useOperacionSync.ts`.
   - Implementar banners y modales de bloqueo cuando el backend indique cierres (`closeReason`, `expectedUnlockAt`) mostrando responsables y pasos para desbloqueo.
   - Exponer indicadores de consistencia (saldo de litros vs. producción, desperdicio permitido vs. registrado) para que los coordinadores puedan autorizar cierres.

5. **Observabilidad, pruebas y monitoreo**
   - Cubrir con React Testing Library los flujos: captura manual, importación exitosa, reintento con errores, cierre de turno y sincronización con Existencias.
   - Añadir pruebas de contratos (`msw` + `zod`) validando estructuras de payloads y respuestas, y smoke tests de WebSocket/polling mediante `vitest` o `jest`.
   - Medir performance con React Profiler en escenarios de 5k registros, ajustando paginación, virtualización y memoización de celdas.
   - Configurar telemetría en `src/lib/observability` para registrar tiempos de importación, tasas de error por módulo y eventos de cierre exitoso/fallido.
   - Documentar flujos E2E críticos (Consumo -> Producción -> Sobrantes) en Notion/Confluence y generar scripts base para Cypress reutilizando los casos manuales.

## Dependencias con los pasos anteriores (01-04)

- **Paso 1 (Preparativos):** Confirmar owners operativos por centro y definir ventanas de operación para coordinar deployments y bloqueos.
- **Paso 2 (Configuración técnica inicial):** Reutilizar providers globales (cliente HTTP, TanStack Query, temas, manejo de sesiones) y el pipeline de importación configurado en este paso.
- **Paso 3 (App shell y navegación):** Aprovechar la shell para exponer indicadores de cierre diario, notificaciones globales y el selector de fecha/producto.
- **Paso 4 (Módulos de configuración):** Consumir catálogos y parámetros actualizados (actividades, empleados, turnos) y respetar los feature flags y permisos definidos en Configuración.

## Métricas y seguimiento sugerido

- **Tiempos de captura:** Promedio <45 segundos para registrar o editar un consumo individual y <3 minutos para importaciones de más de 500 filas.
- **Integridad de datos:** 0 registros en estado `orphan` tras sincronizaciones y ≤2% de registros con errores de validación por lote.
- **Disponibilidad:** Monitorear caídas o bloqueos; meta ≥99% de uptime operativo durante ventanas de captura.
- **Adopción:** Número de usuarios activos diarios y porcentaje de vistas favoritas utilizadas por rol.
- **Calidad de importaciones:** Ratio de éxito en la primera carga ≥85% y disminución semanal de reintentos.

## Entregables

- Módulos de operación diaria conectados a endpoints reales con estados vacíos, mensajes de error consistentes y documentación contextual dentro de la UI.
- Componentes reutilizables de importación (`BulkUploadDialog`, `ProgressPanel`, `ErrorList`) y sincronización (`SyncStatusBadge`, `CloseDayBanner`) versionados y documentados.
- Documentación de flujos E2E críticos, scripts de pruebas manuales, métricas iniciales de performance y tableros de monitoreo configurados.

## Criterios de aceptación

- Listados soportan paginación, ordenamiento, filtros persistentes, exportación (`.csv`/`.xlsx`) y resumen de totales cuando el módulo lo requiera.
- Formularios evitan envíos duplicados, muestran validaciones inline, registran trazabilidad completa (`createdBy`, `updatedBy`, `source`) y respetan reglas de negocio.
- Procesos de importación actualizan automáticamente módulos relacionados, emiten feedback claro (toasts, banners, historial) y permiten reintentos sin pérdida de contexto.
- Los cierres diarios reflejan estados consistentes en Existencias y Costos, bloqueando nuevas capturas hasta que se confirme el balance final.
