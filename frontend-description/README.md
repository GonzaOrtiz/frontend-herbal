# Guía integral para el frontend

Esta carpeta describe cómo debe integrarse la interfaz con los servicios REST del backend. Cada archivo `.md` está organizado por dominio funcional y detalla propósito, flujos de usuario, componentes sugeridos y contratos HTTP. Use esta guía como documento vivo para definir la arquitectura de UI, estandarizar patrones y prevenir interpretaciones ambiguas.

## Cómo está organizado el material

- **Resumen ejecutivo** (`system-overview.md`): mapa maestro con rutas, dependencias y navegación sugerida.
- **Documentos por módulo**: describen propósito, estructura visual, formularios, validaciones y endpoints.
- **Lineamientos transversales** (`ui-ux-guidelines.md`): criterios de diseño, accesibilidad, estados, consistencia visual y manejo de errores.
- **Bitácora de sincronización** (`catalogos.md`, `costos.md`, etc.): módulos con procesos masivos o cálculos especiales detallan pasos y advertencias.
- **Arquitectura de la app** (`frontend-architecture.md`): estructura del layout, componentes globales, manejo de estado y estrategias de navegación entre dominios.
- **Referencia rápida de API** (`api-reference.md`): tabla consolidada de endpoints, parámetros, cabeceras y ejemplos de request/respuesta.

## Stack recomendado y configuraciones base

Para acelerar la implementación y alinear decisiones técnicas se sugiere partir de la siguiente base:

- **Framework**: React + TypeScript con bundler Vite para tiempos de recarga rápidos y soporte de módulos ES nativos.
- **Router**: React Router v6 con rutas anidadas que reflejen la jerarquía descrita en `system-overview.md` y `src/index.ts`.
- **Estado del servidor**: TanStack Query (React Query) para manejar caché, revalidación (`stale-while-revalidate`) y estados de carga por dominio.【F:src/index.ts†L91-L115】
- **Estado global**: Zustand o Redux Toolkit para almacenar autenticación, fecha de cálculo, preferencias de usuario y catálogos reutilizables.【F:src/modules/fecha-calculo/middleware.ts†L9-L21】
- **HTTP client**: Axios con interceptores que agreguen `Authorization` y `x-user`, manejen retries y centralicen el formateo de errores.【F:src/common/middlewares/error-handler.ts†L3-L16】【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】
- **UI kit**: Adoptar Material UI (MUI) como base obligatoria del sistema de diseño, definiendo temas y overrides que respeten la identidad visual de la organización y faciliten el reuso de componentes.
- **Internacionalización**: i18next con namespaces por dominio para habilitar localización temprana.
- **Testing**: Vitest + React Testing Library para pruebas unitarias/componentes y Cypress para flujos end-to-end críticos.

Configurar variables de entorno (`VITE_API_URL`, `VITE_VERSION`, `VITE_DEFAULT_CALCULATION_DATE`) y scripts de npm que automaticen linters (`eslint`, `stylelint`) y validaciones previas a commit.

Cada documento incluye ejemplos de payloads tomados del `swagger.json` del repositorio y referencias directas al código para garantizar consistencia con el backend.【F:docs/swagger.json†L1-L3965】【F:src/index.ts†L8-L115】

## Convenciones globales de integración

### Base técnica
- **Base URL**: todas las rutas expuestas por el backend comienzan con `/api`, salvo la carga de archivos Access (`/import`).【F:src/index.ts†L91-L114】 Configure la instancia HTTP con esta raíz y parametrice el dominio desde variables de entorno.
- **Autenticación**: la API se consume mediante token Bearer. Centralice la inserción del header `Authorization` en un interceptor HTTP.
- **Fecha de cálculo**: el middleware de backend anexa la fecha activa a cada request y lectura; la UI debe permitir cambiarla y propagarla como parte del contexto global.【F:src/modules/fecha-calculo/middleware.ts†L9-L21】【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L12-L93】
- **Errores**: el manejador central devuelve `{ "message": string }` y el código HTTP correspondiente. Muestre el mensaje textual, permita traducción opcional y registre métricas de error por endpoint.【F:src/common/middlewares/error-handler.ts†L3-L16】

### Navegación y layout
- **Inicio**: dashboard con indicadores clave del período activo (`fecha-calculo`), alertas del sistema y accesos rápidos a módulos críticos (Costos, Existencias, Reportes).
- **Menú lateral**: agrupar módulos por dominios (Catálogos, Operación diaria, Distribución de costos, Consolidaciones, Analítica) replicando los routers expuestos en `src/index.ts` para que los usuarios encuentren fácilmente los procesos conocidos.【F:src/index.ts†L91-L115】
- **Barra superior persistente**: mostrar selector de fecha de cálculo, usuario autenticado, buscador global y acceso a notificaciones.
- **Breadcrumbs contextuales**: indicar dominio → módulo → vista para mantener orientación en rutas anidadas.

### Datos y estado
- **Store global**: centralice autenticación, fecha de cálculo, preferencias de filtros y catálogos reutilizables (empleados, centros, actividades). Aplicar caché con invalidación después de POST/PUT/DELETE para reducir llamadas repetitivas.【F:src/index.ts†L91-L115】
- **Hooks/servicios por dominio**: encapsule llamadas HTTP, estados (`isLoading`, `error`, `data`) y transformación de datos. Cada servicio debe agregar `x-user` en operaciones auditables (Costos, Consumos, Importaciones).【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】
- **Manejo de sincronizaciones**: algunos módulos tienen jobs automáticos (catálogos, costos). Muestre banners informativos cuando la sincronización esté activa para evitar acciones duplicadas.【F:src/index.ts†L47-L126】【F:src/modules/catalogos/services/index.ts†L28-L74】

### Tablas y listados
- Paginación configurable (10/25/50) cuando existan más de 20 filas. Si el servicio no provee paginación, hacerlo en memoria; si expone `limit`, `page`, `desde`, `hasta`, respete dichos parámetros.【F:src/index.ts†L94-L111】
- Integrar indicadores de “sin resultados” y botón de recarga.
- Permitir ordenamiento por columnas clave y filtros guardados por usuario (local storage / indexedDB).

### Formularios y validaciones
- Validar en cliente los campos requeridos, formatos de fecha ISO (`YYYY-MM-DD`), números positivos y longitudes máximas descritas en cada módulo.
- Deshabilitar botones de guardar mientras hay solicitudes en curso y evitar envíos duplicados.
- Mostrar errores específicos provenientes de la API y relacionarlos con los campos afectados.
- Implementar autosave de borradores para formularios extensos (asignaciones, costos, importaciones).

### Estados y notificaciones
- **Toasts** para confirmaciones y mensajes informativos.
- **Banners/alertas** para advertencias (`warning`, `balance`), especialmente después de prorrateos y consolidaciones.【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】
- **Diálogos de confirmación** para operaciones destructivas (DELETE, consolidaciones, importaciones). Indicar el impacto y requerir confirmación explícita.

### Accesibilidad y usabilidad
- Compatibilidad con teclado: atajos (`Alt+N` nuevo, `Alt+F` filtrar, `Esc` cerrar modal) y focus management.
- Contraste AA/AAA en tablas densas; ofrecer modo oscuro opcional.
- Mensajes claros y contextualizados: detallar causas, sugerir acciones, linkear a documentación interna.
- Internacionalización preparada (textos en archivos de traducción) y soporte para formatos regionales (moneda, fecha).

## Roadmap de implementación sugerido

1. **Configurar cimientos técnicos**
   - Inicializar proyecto con Vite + React + TypeScript.
   - Agregar ESLint, Prettier, Husky y commitlint para mantener calidad.
   - Integrar React Query, Zustand/Redux y Axios con interceptores básicos.
2. **Construir app shell**
   - Implementar layout persistente (header con selector de fecha, sidebar, breadcrumbs) reutilizando componentes descritos en `frontend-architecture.md`.
   - Conectar selector de fecha con endpoints de `fecha-calculo` y propagar cambios mediante el store global.【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L12-L93】
3. **Desarrollar módulos prioritarios**
   - Comenzar por Configuración (catálogos base) para asegurar catálogos cacheados.
   - Continuar con Operación diaria y Costos, integrando validaciones y estados de carga definidos en cada documento de dominio.
   - Habilitar procesos masivos (importaciones, consolidaciones) con manejo de progreso y auditoría.
4. **Analítica y reportes**
   - Implementar componentes reutilizables de filtros, tablas y exportaciones (`format=csv|xlsx`).【F:src/modules/reportes/services/reports.service.ts†L28-L155】
   - Asegurar deep-linking y sincronización de filtros entre módulos relacionados.
5. **Calidad y lanzamiento**
   - Automatizar pruebas unitarias y E2E en CI.
   - Verificar checklist de accesibilidad, rendimiento y consistencia documentado en `ui-ux-guidelines.md`.
   - Preparar manual de usuario con capturas de los flujos críticos.

## Índice de módulos

| Módulo | Descripción | Documento |
| --- | --- | --- |
| Actividades | Catálogo de actividades de producción. | [actividades.md](./actividades.md) |
| Asignación de actividades a empleados | Registro de horas por actividad. | [asignacion-actividad-empleado.md](./asignacion-actividad-empleado.md) |
| Asignación de centros | Distribución de costos entre centros. | [asignacion-centro.md](./asignacion-centro.md) |
| Historial de asignaciones | Consulta de prorrateos por centro. | [asignacion-historial.md](./asignacion-historial.md) |
| Centros asignaciones manuales | Ajustes manuales y resultados finales. | [centros-asignaciones.md](./centros-asignaciones.md) |
| CIF | Gestión de costos indirectos de fabricación. | [cif.md](./cif.md) |
| Catálogos (insumos, listas de precio, maquinarias) | ABM y sincronización masiva. | [catalogos.md](./catalogos.md) |
| Centro de apoyo | Información y gastos del centro de apoyo. | [centro-apoyo.md](./centro-apoyo.md) |
| Centros de producción | ABM de centros. | [centro-produccion.md](./centro-produccion.md) |
| Consumos | Registro de consumos por producto y fecha. | [consumos.md](./consumos.md) |
| Costos | Gestión de gastos, depreciaciones, sueldos y prorrateos. | [costos.md](./costos.md) |
| Empleados | Catálogo de empleados. | [empleados.md](./empleados.md) |
| Existencias y asientos | Consolidación de inventario y asientos de control. | [existencias.md](./existencias.md) |
| Asientos de control | Gestión de débitos y créditos por consolidación. | [asientos-control.md](./asientos-control.md) |
| Fecha de cálculo | Control del periodo activo. | [fecha-calculo.md](./fecha-calculo.md) |
| Importación MDB | Procesos de importación desde Access. | [importacion.md](./importacion.md) |
| Litros de crema | Registro de producción de crema líquida. | [litros-crema.md](./litros-crema.md) |
| Pérdidas | Control de mermas y pérdidas. | [perdidas.md](./perdidas.md) |
| Producción de crema | Gestión de lotes de crema. | [produccion-crema.md](./produccion-crema.md) |
| Producciones | Registro de producciones generales. | [producciones.md](./producciones.md) |
| Reportes | Descarga de reportes operativos y financieros. | [reportes.md](./reportes.md) |
| Sobrantes | Registro de sobrantes de producto. | [sobrantes.md](./sobrantes.md) |

## Buenas prácticas adicionales para UI/UX

1. **Dashboards contextuales**: cada dominio debe ofrecer indicadores resumidos (totales, diferencias, alertas). Aproveche tarjetas y gráficos sencillos para comunicar tendencias.
2. **Componentes reutilizables**: cree bibliotecas de formularios maestro-detalle, tablas con edición inline, filtros persistentes y paneles de resultados. Esto acelera el desarrollo y mantiene consistencia.
3. **Optimización de rendimiento**: utilice data virtualization en tablas con más de 500 registros y estrategia de `debounce` para buscadores.
4. **Seguimiento de auditoría**: mostrar `createdAt`, `updatedAt`, `x-user` y `accessId` cuando estén disponibles para mejorar trazabilidad.
5. **Integración con reportes**: desde cualquier módulo permita abrir el reporte correspondiente con filtros prellenados (deep-linking) para mantener continuidad del análisis.【F:src/modules/reportes/services/reports.service.ts†L28-L155】
6. **Gestión de permisos**: aunque el backend no expone roles explícitos, prepare el frontend para ocultar acciones críticas (importaciones, consolidaciones) mediante flags de configuración.
7. **Testing UI**: documente escenarios críticos por módulo (carga de costos, consolidación de existencias, importaciones fallidas) y prepare datos mockeados basados en los ejemplos de esta carpeta.

Con estas pautas y la documentación detallada de cada módulo podrá planificar, diseñar y construir el frontend de manera consistente con los contratos REST disponibles.
