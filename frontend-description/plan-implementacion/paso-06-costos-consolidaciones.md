# Paso 6. Costos, asignaciones y consolidaciones

**Objetivo:** Implementar los módulos que calculan, distribuyen y consolidan costos asegurando trazabilidad.

## Artefactos de referencia

- Documentos funcionales: `costos.md` (incluye consolidación), `cif.md`, `existencias.md`, `asientos-control.md`, `centros-asignaciones.md`.
- Procesos automáticos y reglas de negocio: `sobrantes.md` (relaciones con costos), `consumos.md` (impacto en costos).
- API y flujos batch: [`frontend-description/asientos-control.md`](../asientos-control.md) y `api-reference.md` (endpoints de costos y consolidados).

## Checklist operativo

1. **Arquitectura de módulo**
   - Crear carpeta `src/modules/costos` con submódulos `cif`, `asignaciones`, `existencias`, `asientos`.
   - Definir rutas maestro-detalle (lista principal + panel de detalle + historial) siguiendo diagramas de `costos.md`.
   - Establecer contextos compartidos para filtros (periodo, centro, producto) reutilizando hooks globales.

2. **Visualizaciones y cálculos**
   - Implementar componentes `BalanceSummary`, `AllocationBreakdown` y `TrendChart` basados en MUI + Recharts.
   - Formatear montos en moneda y porcentajes con utilidades centralizadas (`formatCurrency`, `formatPercentage`).
   - Mostrar comparativos contra periodos anteriores y variaciones porcentuales cuando la documentación lo requiera.

3. **Procesos largos y consolidaciones**
   - Construir `ProcessRunnerDialog` para operaciones de prorrateo/consolidación con seguimiento de progreso.
   - Integrar endpoints asincrónicos que devuelven `processId` y conectarlos con un polling que actualice el estado.
   - Permitir reintentos controlados y cancelaciones según reglas definidas en `costos.md` (sección "Reprocesos").

4. **Auditoría y trazabilidad**
   - Mostrar bitácoras en componentes `AuditTimeline` y `ProcessLog`, destacando `x-user`, `createdAt`, `updatedAt`.
   - Implementar exportaciones de historial (`.xlsx`) cuando esté especificado.
   - Registrar enlaces cruzados (deep-links) entre costos y asientos contables para facilitar la navegación.

5. **Pruebas y validaciones**
   - Crear pruebas unitarias para funciones de transformación (prorrateo, distribución de CIF) asegurando coincidencia con ejemplos documentados.
   - Añadir pruebas de integración que validen el flujo completo: disparar consolidación, monitorear progreso, revisar resultados.
   - Medir tiempos de respuesta y garantizar feedback visual para procesos >5s.

## Entregables

- Módulos de Costos y consolidaciones funcionales con manejo de estados de proceso (en ejecución, completado, error).
- Componentes reutilizables para indicadores de balance, timelines de auditoría y seguimiento de procesos.
- Documentación de dependencias entre módulos y triggers de sincronización para soporte a QA/backend.

## Criterios de aceptación

- Las operaciones largas muestran feedback persistente, permiten reintentos controlados y registran resultados en la bitácora.
- Los datos clave se presentan con formato de moneda y porcentajes consistentes, incluyendo variaciones y comparativos.
- La navegación entre Costos, Existencias y Asientos está enlazada mediante deep-linking y respeta permisos definidos.
