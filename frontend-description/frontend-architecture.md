# Arquitectura funcional del frontend

Este documento describe cómo estructurar la aplicación para ofrecer una experiencia coherente, escalable y alineada con los contratos REST disponibles. Complementa los manuales por módulo con decisiones de layout, flujos globales y componentes compartidos que facilitan la implementación del frontend.

## Estructura general de navegación

1. **Inicio**
   - Dashboard con resumen contable del período activo utilizando `GET /api/reportes/comparativo` y accesos directos a los procesos diarios.【F:src/modules/reportes/services/reports.service.ts†L88-L104】
   - Tarjetas con indicadores de sincronización (catálogos, costos) y alertas provenientes de respuestas con `warning` (Costos, Existencias).【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】【F:src/modules/existencias/services/existencias.service.ts†L45-L137】
2. **Configuración**
   - Submenú con Actividades, Empleados, Centros (producción y apoyo), Catálogos y Fecha de cálculo. Los módulos comparten CRUD básicos y deben reutilizar formularios modales y tablas paginadas.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L10-L13】【F:src/modules/catalogos/controller.ts†L20-L58】【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】
3. **Operación diaria**
   - Consumos, Producciones, Producción de crema, Litros de crema, Pérdidas y Sobrantes. Cada vista combina filtros por fecha/producto con tablas densas y badges para `accessId` (importaciones).【F:src/modules/consumo/routes/consumo.routes.ts†L16-L27】【F:src/modules/produccion/routes/produccion.routes.ts†L16-L27】【F:src/modules/prodcrema/routes/prodcrema.routes.ts†L7-L10】【F:src/modules/litroscrema/routes/litroscrema.routes.ts†L7-L15】【F:src/modules/perdida/routes/perdida.routes.ts†L11-L20】【F:src/modules/sobrante/routes/sobrante.routes.ts†L9-L35】
4. **Distribución y asignaciones**
   - Gestión de asignaciones actividad-empleado, asignación de centros, historial de prorrateos y consultas de costos finales. Las vistas combinan tablas maestro-detalle con validaciones gráficas de porcentajes.【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】【F:src/modules/asignacion-historial/routes/asignacion-historial.routes.ts†L6-L7】【F:src/modules/centros/routes/costos-finales.routes.ts†L6-L7】
5. **Costos y consolidaciones**
   - Submenú con Costos, CIF, Existencias, Asientos y Asignaciones manuales. Requiere seguimiento de balances (`debitos`, `creditos`, `balance`) y monitoreo de procesos largos como el prorrateo automático y las consolidaciones.【F:src/modules/costos/routes/costos.routes.ts†L19-L73】【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/existencias/routes/existencias.routes.ts†L7-L10】【F:src/modules/existencias/routes/asiento-control.routes.ts†L7-L8】【F:src/modules/centros-asignaciones/routes/centros-asignaciones.routes.ts†L9-L10】
6. **Analítica y reportes**
   - Vistas para consultas agregadas y descargas (`format=csv|xlsx`). Cada reporte debe ejecutarse de forma independiente para permitir cargas paralelas.【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】

## App shell y componentes persistentes

- **Header**
  - Selector de fecha de cálculo con acceso rápido a histórico (`GET /api/fecha-calculo`, `POST /api/fecha-calculo`). Cambiar la fecha debe emitir eventos globales que refresquen queries dependientes.【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】【F:src/modules/fecha-calculo/middleware.ts†L9-L21】
  - Área de usuario con opciones de cierre de sesión, preferencias y enlaces a documentación.
  - Icono de notificaciones que reúna mensajes de procesos largos (importaciones, consolidaciones).
- **Sidebar**
  - Lista de dominios mencionados arriba siguiendo el orden del archivo `src/index.ts` para evitar inconsistencias entre backend y navegación.【F:src/index.ts†L91-L115】
  - Permitir estado colapsado con tooltips y destacar el módulo activo mediante color y borde.
- **Footer o barra auxiliar**
  - Mostrar información del entorno (fecha de cálculo activa, base URL) y acceso rápido al log de auditoría.

## Layout de vistas

1. **Listas maestras** (Actividades, Empleados, Catálogos, Consumos, Costos)
   - Cabecera con filtros persistentes, acciones masivas y contador de resultados.
   - Tabla con soporte para ordenamiento, selección múltiple y exportación.
   - Panel lateral (drawer) para edición rápida o detalle de auditoría (`x-user`, `accessId`).【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/importaciones/controllers/importaciones.controller.ts†L37-L198】
2. **Formularios complejos** (Asignaciones, Costos, Importaciones)
   - Dividir en pasos con validaciones progresivas y barra de progreso.
   - Guardar borradores locales y mostrar resumen antes de confirmar envíos masivos.
3. **Dashboards y reportes**
   - Tarjetas KPI + tablas/ gráficos. Integrar componentes de exportación que transformen la respuesta al formato seleccionado (`format=csv|xlsx`).【F:src/modules/reportes/services/reports.service.ts†L28-L155】
4. **Procesos automáticos** (Consolidar existencias, Recalcular CIF, prorrateo de costos)
   - Mostrar modales de confirmación que describan el impacto y exigir confirmación explícita para acciones manuales (consolidar, recalcular).
   - Indicar que el prorrateo de costos se ejecuta en background tras importaciones o sincronizaciones y mostrar la fecha/resultado en un panel dedicado.【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】
   - Tras ejecutar procesos manuales, refrescar vistas relacionadas (Existencias → Asientos, CIF → Costos finales).【F:src/modules/existencias/services/existencias.service.ts†L82-L137】【F:src/modules/cif/services/cif.service.ts†L87-L133】

## Gestión de estado y servicios

- Utilizar un store global para: autenticación, fecha de cálculo, filtros recientes, catálogos reutilizables y preferencias de tablas.
- Encapsular cada dominio en hooks/servicios (`useConsumos`, `useCostos`) que gestionen `isLoading`, `error` y transformación de datos.
- Incluir interceptores HTTP que agreguen automáticamente token Bearer y cabecera `x-user` en endpoints auditables (Costos, Consumos, Importaciones).【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
- Implementar capa de manejo de errores que traduzca `{ "message": string }` a toasts o mensajes inline según contexto.【F:src/common/middlewares/error-handler.ts†L3-L16】
- Configurar estrategias de revalidación (`stale-while-revalidate`) para catálogos y reportes; limpiar caché cuando se ejecute un POST/PUT/DELETE relacionado.

## Estructura de carpetas recomendada

```
src/
├─ app/                # bootstrap, providers globales, router
├─ modules/
│  ├─ costos/
│  │  ├─ api/          # funciones HTTP (axios + React Query)
│  │  ├─ components/   # tablas, formularios específicos
│  │  ├─ hooks/        # `useCostosList`, `useSyncStatus`
│  │  └─ pages/        # pantallas conectadas al router
│  └─ ...
├─ shared/
│  ├─ components/      # tablas genéricas, toasts, breadcrumbs
│  ├─ hooks/           # `useAuth`, `useCalculationDate`
│  ├─ layouts/         # app shell, dashboards base
│  ├─ stores/          # Zustand/Redux slices
│  └─ utils/           # formateadores (moneda, fechas)
├─ theme/              # design tokens, tipografía, colores
└─ tests/              # helpers de testing y mocks comunes
```

- Mantener independencia entre módulos para permitir carga dinámica (code splitting) y facilitar ownership por squad.
- Evitar imports cruzados entre dominios; compartir únicamente a través de `shared/`.
- Documentar cada módulo con README propio que enlace a los archivos de esta carpeta para alinear negocio con implementación.

## Integración con herramientas de desarrollo

- **Control de calidad**: configurar pipelines de CI que ejecuten lint, pruebas unitarias (Vitest) y E2E (Cypress) antes del deploy.
- **Storybook**: publicar componentes críticos (tablas, formularios, banners) para validar estados con stakeholders.
- **MSW (Mock Service Worker)**: simular respuestas del backend en desarrollo y testing, replicando payloads descritos en esta documentación.【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/reportes/services/reports.service.ts†L28-L155】
- **Analítica de uso**: instrumentar eventos (por ejemplo, ejecución de prorrateo, descargas de reportes) respetando políticas de privacidad.

## Flujos críticos

1. **Cierre mensual**
   - Actualizar fecha de cálculo → sincronizar catálogos → cargar operaciones diarias → registrar costos → ejecutar asignaciones → consolidar existencias y generar asientos → recalcular CIF → validar reportes comparativos.【F:src/modules/catalogos/controllers/catalog.controller.ts†L20-L70】【F:src/modules/consumo/controllers/consumo.controller.ts†L25-L55】【F:src/modules/costos/routes/costos.routes.ts†L19-L73】【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】【F:src/modules/existencias/services/existencias.service.ts†L45-L137】【F:src/modules/cif/services/cif.service.ts†L87-L133】【F:src/modules/reportes/services/reports.service.ts†L59-L104】
2. **Importación desde Access**
   - Subir archivo (`POST /import`) → mostrar progreso por tabla → guardar bitácora automática (`GET /api/importaciones`) → permitir ajustes manuales o eliminaciones.【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
   - Notificar módulos afectados (Costos, Consumos, Litros, Pérdidas, Sobrantes) para recargar datos.
3. **Auditoría y seguimiento**
   - Registrar usuario (`x-user`) en operaciones sensibles y mostrarlo en paneles de auditoría.
   - Vincular Asientos de control con Existencias para navegar rápidamente entre ambos módulos.【F:src/modules/existencias/routes/asiento-control.routes.ts†L7-L8】

## Patrones de interacción recomendados

- **Filtros persistentes**: almacenar valores frecuentes por módulo y sincronizarlos con la URL para compartir vistas (deep-linking).【F:src/modules/reportes/services/reports.service.ts†L28-L155】
- **Confirmaciones con resumen**: antes de operaciones destructivas o masivas (importaciones, consolidaciones) mostrar modal con lista de cambios esperados. Para el prorrateo automático, informar al usuario que el cálculo se ejecutará en background tras la sincronización correspondiente.
- **Estados vacíos enriquecidos**: ofrecer acciones sugeridas (importar datos, crear registro) cuando no existan resultados.
- **Accesibilidad**: garantizar navegación por teclado, foco visible y contraste AA en tablas densas; proveer atajos (`Alt+N`, `Alt+F`, `Esc`).
- **Rendimiento**: aplicar virtualización de filas cuando existan más de 500 registros y `debounce` en filtros tipo texto.

Esta arquitectura proporciona una visión integral para organizar la aplicación, reducir decisiones ad-hoc y asegurar que cada módulo se conecte correctamente con los servicios REST existentes.
