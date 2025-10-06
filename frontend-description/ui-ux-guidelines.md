# Lineamientos UI/UX transversales

Este documento complementa las guías por módulo con prácticas recomendadas para construir una interfaz consistente, accesible y fácil de mantener.

## Diseño visual y layout

- **Grid responsivo**: utilice un layout basado en 12 columnas con puntos de quiebre en 1280 px, 960 px y 600 px para garantizar que las tablas puedan desplazarse horizontalmente en pantallas pequeñas.
- **Jerarquía de información**: priorice KPIs y alertas en la parte superior, seguidos de filtros y finalmente tablas o formularios. Los títulos deben incluir el período activo (`fecha-calculo`) cuando sea relevante para contextualizar la información.【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L12-L93】
- **Componentes recurrentes**: defina versiones estándar de headers con acciones primarias, tabs, paneles laterales (drawers) y tarjetas de métricas. Esto permite reutilizar estilos entre módulos como Costos, Consumos y Reportes.
- **Feedback inmediato**: combine skeletons para listas y spinners para operaciones largas (importaciones, prorrateos). Active skeletons en tablas cuando la carga supere los 300 ms para reducir percepción de espera.

### Sistema de diseño y tokens

- Definir variables globales para colores, tipografía, espaciados y radios en `theme/` y documentar equivalencias con el manual corporativo.
- Establecer escalas tipográficas (12, 14, 16, 18, 24, 32 px) y pesos (regular, semibold, bold) reutilizables en tarjetas, tablas y formularios.
- Mantener tokens de estado (`success`, `info`, `warning`, `error`) alineados con las respuestas del backend (`warning`, `balance`, `consistente`).【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】【F:src/modules/reportes/services/reports.service.ts†L88-L104】
- Documentar componentes en Storybook junto con sus variantes (hover, focus, disabled) para asegurar consistencia visual.

## Interacción y navegación

- **Menú lateral colapsable**: permita contraerlo para maximizar el espacio de tablas. Mantenga iconografía y tooltips para identificar módulos cuando esté colapsado.
- **Breadcrumbs**: muestre siempre dominio → módulo → vista y ofrezca navegación directa al nivel superior para evitar pérdidas de contexto.
- **Deep-linking**: cualquier filtro relevante debe reflejarse en la URL (query string) para compartir vistas exactas, especialmente en Reportes, Consumos y Existencias.【F:src/modules/reportes/services/reports.service.ts†L28-L155】【F:src/modules/existencias/services/existencias.service.ts†L45-L137】
- **Cross navigation**: facilite saltos entre módulos relacionados (por ejemplo, desde Existencias abrir Producciones filtradas por producto). Pre-cargue catálogos compartidos en un store centralizado.【F:src/modules/existencias/services/movimientos.service.ts†L15-L95】【F:src/index.ts†L91-L115】

## Formularios y validaciones

- **Validación progresiva**: realice validaciones “on blur” y resalte campos con errores mediante texto de ayuda y iconografía. Los mensajes deben reutilizar la respuesta `{ "message": string }` del backend para evitar discrepancias.【F:src/common/middlewares/error-handler.ts†L3-L16】
- **Estados de formulario**: utilice tres estados visuales (borrador, listo para enviar, enviado) y represéntelos en botones y toolbars. Permita guardar borradores locales en módulos complejos (Costos, Asignaciones, Importaciones).
- **Acciones masivas**: cuando el backend acepta arreglos (Costos, Importaciones, Catálogos) muestre contadores de registros, validaciones por fila y resúmenes previos a enviar.【F:src/modules/costos/dto/costos.dto.ts†L1-L229】【F:src/modules/catalogos/controller.ts†L20-L58】【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
- **Confirmaciones**: para operaciones destructivas exija la introducción del nombre o número del registro para minimizar errores (por ejemplo, escribir el `nroCentro` antes de eliminar una asignación).

## Tablas y visualización de datos

- **Columnas dinámicas**: permita mostrar/ocultar columnas para adaptarse a necesidades contables; guardar preferencias por usuario en local storage.
- **Celdas enriquecidas**: combine badges para estados (`esGastoDelPeriodo`, `importado`, `warning`) con tooltips que expliquen el significado de cada valor.【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】【F:src/modules/consumo/controllers/consumo.controller.ts†L25-L55】
- **Agrupaciones**: habilite agrupación por columnas (centro, producto, fecha) y totales parciales cuando la densidad de información lo amerite.
- **Exportaciones**: todas las tablas deben ofrecer exportación en CSV/Excel respetando filtros activos. Para procesos costosos (reportes, consolidaciones), muestre barra de progreso y notifique cuando la descarga esté lista.【F:src/modules/reportes/services/reports.service.ts†L28-L155】

## Accesibilidad

- Cumpla con WCAG 2.1 AA: contraste mínimo 4.5:1, foco visible, navegación completa con teclado.
- Incluir etiquetas aria en iconos de acción y descripciones textuales en modales y banners.
- Proveer mecanismo de “skip to content” para saltar la navegación lateral.
- Configurar tamaños de fuente relativos (`rem`) y soporte para zoom del navegador.

## Notificaciones y mensajes

- **Sistema de toasts unificado**: defina variantes (éxito, información, advertencia, error). Adjunte detalles técnicos opcionales en un panel de depuración para usuarios avanzados.
- **Alertas persistentes**: cuando el backend devuelva `warning` o `balance` distinto de cero (ej. prorrateos), muestre banners con acciones recomendadas (revisar registros, abrir reporte detallado).【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】
- **Registro de actividad**: agregue panel lateral con últimas acciones (creaciones, importaciones, consolidaciones) utilizando los mensajes retornados por la API y la cabecera `x-user` enviada en operaciones sensibles.【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/importaciones/services/importaciones.service.ts†L20-L112】

## Rendimiento y resiliencia

- Implementar reintentos exponenciales para GET/PUT idempotentes. Para POST sensibles, muestre opción de reintentar manualmente informando que el backend valida `accessId` para evitar duplicados.【F:src/modules/cif/services/cif.service.ts†L21-L146】【F:src/modules/existencias/services/existencias.service.ts†L27-L44】
- Cachear catálogos y refrescarlos tras operaciones de escritura; use `stale-while-revalidate` para mejorar tiempos de respuesta.
- Monitorear tiempos de respuesta por endpoint y registrar métricas para priorizar optimizaciones.

## Seguridad y trazabilidad

- Centralizar la inyección de la cabecera `x-user` y mostrar en UI quién ejecutó la última operación en módulos de auditoría (Costos, Consumos, Importaciones).【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】【F:src/modules/importaciones/controllers/importaciones.controller.ts†L44-L119】
- Deshabilitar botones mientras se espera respuesta para evitar ejecuciones duplicadas de procesos costosos (consolidaciones, recalcular CIF).【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/existencias/services/existencias.service.ts†L82-L119】
- Registrar logs de usuario (quién, cuándo, qué) en un panel de auditoría basado en los mensajes del backend para facilitar inspecciones.

## Checklist por release

1. Navegación consistente entre dominios y breadcrumbs correctos.
2. Formularios validados y mensajes de error alineados con el backend.
3. Paginación y filtros persistentes funcionando según especificaciones.
4. Exportaciones disponibles en tablas críticas (Costos, Consumos, Reportes, Existencias).
5. Estados de carga y manejo de errores cubiertos (retry, indicadores, mensajes).
6. Accesibilidad AA verificada mediante herramientas automáticas y pruebas manuales.
7. Sincronización de fecha de cálculo en toda la aplicación tras actualizarla desde el header.

Aplicar estos lineamientos garantiza que los módulos descritos en esta carpeta se integren de forma armónica y brinden una experiencia robusta para usuarios operativos y contables.
