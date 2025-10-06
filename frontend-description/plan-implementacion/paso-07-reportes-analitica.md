# Paso 7. Reportes y analítica

**Objetivo:** Entregar las vistas de consulta y descarga de información consolidada.

## Actividades principales
- Implementar filtros avanzados con persistencia en URL y sincronización con TanStack Query.
- Construir tablas y gráficos basados en Material UI y librerías compatibles (Recharts, Nivo) respetando el tema definido.
- Habilitar exportaciones (`csv`, `xlsx`) reutilizando la lógica definida en `reportes.md` y servicios asociados.
- Añadir indicadores de rendimiento y mensajes de estados vacíos contextualizados.
- Documentar los flujos de reportes en guías rápidas para usuarios finales.

## Entregables
- Vistas de reportes con carga independiente por módulo y componentes reutilizables de filtros.
- Mecanismo de exportación parametrizable con manejo de errores y seguimiento de progreso.
- Documentación de soporte que explique cómo interpretar los reportes disponibles.

## Criterios de aceptación
- Los filtros se pueden compartir mediante la URL (deep-linking).
- Las descargas respetan permisos y muestran confirmaciones al finalizar.
- Los gráficos mantienen accesibilidad (descripciones, etiquetas, colores con contraste suficiente).
