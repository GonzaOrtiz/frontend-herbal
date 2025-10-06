# Paso 7. Reportes y analítica

**Objetivo:** Entregar las vistas de consulta y descarga de información consolidada.

## Artefactos de referencia

- Diseño funcional de reportes: [`frontend-description/reportes.md`](../reportes.md).
- Datos de soporte y métricas: `costos.md` (indicadores financieros), `consumos.md` (indicadores de producción), `sobrantes.md` (KPIs de desperdicio).
- Requerimientos de exportación y formatos: `deployment.md` (consideraciones de tamaño), `importacion.md` (estructura de archivos).
- Guías de UX para visualizaciones: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md).

## Checklist operativo

1. **Arquitectura de reportes**
   - Crear módulo `src/modules/reportes` con rutas por categoría (Financieros, Operativos, Auditoría).
   - Implementar layout específico con panel de filtros lateral y área principal para resultados.
   - Asegurar carga lazy por reporte para optimizar bundle size.

2. **Filtros avanzados**
   - Construir componente `AdvancedFilters` con persistencia en URL (`useSearchParams`) y sincronización con TanStack Query.
   - Incorporar presets guardables y compartibles vía deep-linking.
   - Validar combinaciones de filtros según reglas de `reportes.md` (por ejemplo, relación entre fecha y centro).

3. **Visualizaciones y tablas**
   - Utilizar `Recharts` (o `Nivo`) para gráficos y asegurar accesibilidad (descripciones ARIA, colores con contraste AA).
   - Implementar tablas con agrupaciones, subtotales y totales según ejemplos del documento funcional.
   - Añadir tooltips y leyendas personalizadas que expliquen indicadores clave.

4. **Exportaciones y descargas**
   - Centralizar lógica de exportación en `useReportExport` compatible con `csv` y `xlsx`.
   - Mostrar progreso de exportación, límite de filas y mensajes cuando se excede el máximo permitido.
   - Registrar cada descarga en la bitácora de auditoría con parámetros utilizados.

5. **Rendimiento y soporte**
   - Implementar loaders skeleton y mensajes de estado vacío contextualizados.
   - Medir performance de gráficos y tablas (Core Web Vitals) y optimizar memoización.
   - Documentar cada reporte en guías rápidas (PDF o Markdown) con interpretación de KPIs y escenarios de uso.

## Entregables

- Vistas de reportes con carga independiente por módulo y componentes reutilizables de filtros.
- Mecanismo de exportación parametrizable con manejo de errores, seguimiento de progreso y bitácora de descargas.
- Documentación de soporte que explique cómo interpretar los reportes disponibles, incluyendo capturas y definiciones de KPIs.

## Criterios de aceptación

- Los filtros se pueden compartir mediante la URL (deep-linking) y se restauran al volver a la vista.
- Las descargas respetan permisos, notifican al usuario al finalizar y registran auditoría.
- Los gráficos mantienen accesibilidad (descripciones, etiquetas, colores con contraste suficiente) y rendimiento aceptable.
