# Módulo de Operación diaria

Este módulo concentra los procesos transaccionales descritos en la planeación del Paso 5 y cubre los flujos diarios de Consumos, Producciones, Litros de crema, Pérdidas y Sobrantes. Se apoya en los catálogos y configuraciones de los pasos anteriores y sigue los lineamientos de la carpeta `frontend-description`.

## Referencias funcionales

- [Consumos](../../../frontend-description/consumos.md)
- [Producciones](../../../frontend-description/producciones.md)
- [Litros de crema](../../../frontend-description/litros-crema.md)
- [Pérdidas](../../../frontend-description/perdidas.md)
- [Sobrantes](../../../frontend-description/sobrantes.md)
- [Asignaciones y responsables](../../../frontend-description/asignacion-actividad-empleado.md)
- [Importaciones masivas](../../../frontend-description/importacion.md)
- [Lineamientos de UI/UX](../../../frontend-description/ui-ux-guidelines.md)

## Componentes clave

- **Selector contextual** que reutiliza la fecha de cálculo global y persiste filtros por módulo en `localStorage`.
- **Tablas densas virtualizadas** con agrupación por lote/turno y columnas de trazabilidad (`source`, `syncStatus`, `lastImportedAt`).
- **Panel de acciones masivas** para aprobar, recalcular o cerrar turno con evaluación previa del impacto en existencias.
- **Diálogo de carga masiva** que valida archivos estructurados contra esquemas declarativos y genera bitácoras descargables en `.csv` y `.json`.
- **Banners de cierre** que muestran bloqueos emitidos por backend (`closeReason`, `expectedUnlockAt`).

## Sincronización

La lógica de sincronización vive en `hooks/useOperacionSync.ts` y coordina los eventos generados por Producción con Existencias y Costos. Cada mutación dispara invalidaciones sobre las queries involucradas y notifica a los módulos afectados mediante un bus de eventos simple.

## Observabilidad

Los flujos de importación y cierres operativos reportan métricas a `src/lib/observability/logger.ts`, registrando tiempos de importación, tasas de error y eventos de cierre exitoso/fallido.

## Pruebas

Se documenta la estrategia de pruebas para que el equipo extienda la cobertura con React Testing Library y MSW sobre los flujos críticos descritos (importación, sincronización y cierres). El directorio `__tests__/` queda reservado para incorporar los casos automatizados una vez que se conecte con servicios reales.
