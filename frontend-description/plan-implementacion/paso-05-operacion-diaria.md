# Paso 5. Operación diaria y procesos transaccionales

**Objetivo:** Cubrir los flujos diarios de captura de información (Consumos, Producciones, Litros, Pérdidas, Sobrantes).

## Artefactos de referencia

- Detalle de procesos: `consumos.md`, `producciones.md`, `litros-crema.md`, `perdidas.md`, `sobrantes.md`.
- Reglas de importación y bitácoras: [`frontend-description/importacion.md`](../importacion.md).
- Historias de usuario y asignaciones: `asignacion-actividad-empleado.md`, `asignacion-historial.md`, `centros-asignaciones.md`.
- Parámetros transaccionales y cálculos: `consumos.md` (sección de cálculos), `produccion-crema.md`.

## Checklist operativo

1. **Diseño de flujos y filtros**
   - Implementar filtros globales por fecha de cálculo, producto, centro y `accessId` reutilizando el selector del Paso 3.
   - Alinear los defaults y placeholders con las descripciones de cada módulo (ej. filtros de Consumos vs Producción).
   - Permitir guardado de vistas favoritas según rol para agilizar la operación diaria.

2. **Tablas y edición**
   - Construir tablas densas con `MUI Data Grid` soportando edición inline donde el documento lo especifique (ej. ajustes rápidos en Consumos).
   - Incluir columnas de estado de sincronización y marcas de procedencia (`manual`, `importado`, `calculado`).
   - Habilitar acciones masivas (aprobar, revertir, cerrar día) con diálogos de confirmación y resúmenes de impacto.

3. **Importaciones y validaciones**
   - Implementar componente `BulkUploadDialog` con arrastre, validación por esquema (`zod`) y barra de progreso.
   - Mostrar bitácoras de errores descargables (`.csv`) y permitir reintentos parciales siguiendo `importacion.md`.
   - Registrar eventos de importación en el historial del módulo y vincularlos a `x-user` y timestamp.

4. **Integraciones y sincronización**
   - Configurar polling o WebSockets (según disponibilidad) para reflejar cambios generados por procesos automáticos.
   - Sincronizar con módulos dependientes (ej. la aprobación de Producciones actualiza Existencias).
   - Implementar banners de alerta cuando el backend indique bloqueos o cierres contables.

5. **Pruebas y monitoreo**
   - Crear pruebas de integración con React Testing Library cubriendo: creación manual, importación exitosa, manejo de errores.
   - Medir performance de tablas grandes utilizando herramientas de React Profiler y ajustar virtualización si es necesario.
   - Documentar flujos E2E críticos (Consumo -> Producción -> Sobrantes) para posterior automatización en Cypress.

## Entregables

- Módulos de operación diaria conectados a endpoints reales con estados vacíos y mensajes de error consistentes.
- Componentes reutilizables para manejo de importaciones (`BulkUploadDialog`, `ProgressPanel`, `ErrorList`).
- Documentación de flujos E2E críticos y métricas de rendimiento iniciales.

## Criterios de aceptación

- Los listados soportan paginación, ordenamiento, filtros persistentes y exportación cuando corresponda.
- Los formularios evitan envíos duplicados, muestran validaciones inline y registran la trazabilidad requerida.
- Los procesos de importación actualizan automáticamente los módulos relacionados tras completarse y emiten feedback claro.
