# Paso 1. Preparativos y alineación

**Objetivo:** Alinear a los equipos de negocio, backend y frontend sobre alcance, prioridades y criterios de éxito antes de escribir código.

## Artefactos de referencia

- Visión funcional general: [`frontend-description/system-overview.md`](../system-overview.md).
- Lineamientos de experiencia: [`frontend-description/ui-ux-guidelines.md`](../ui-ux-guidelines.md).
- Arquitectura propuesta y stack tecnológico: [`frontend-description/frontend-architecture.md`](../frontend-architecture.md).
- Expectativas de cada dominio funcional: revisar los resúmenes de los módulos en `frontend-description/*.md` (por ejemplo `costos.md`, `consumos.md`, `reportes.md`).

## Checklist operativo

1. **Kickoff y alcance compartido**
   - Convocar a representantes de negocio para cada módulo funcional (Costos, Producción, Reportes, etc.).
   - Revisar el mapa de dominios del `system-overview` y validar si existen dependencias nuevas que deban documentarse.
   - Registrar riesgos iniciales (dependencias de API, definición de permisos, migraciones de datos) usando la matriz de riesgos del proyecto.

2. **Definición de objetivos de UX/UI**
   - Acordar el nivel de accesibilidad objetivo (AA) y los indicadores de satisfacción (NPS interno, tiempo de capacitación) según `ui-ux-guidelines`.
   - Seleccionar variante de tema (claro/oscuro, densidad de tablas) y definir tokens iniciales (paleta principal/secundaria, tipografía).
   - Identificar componentes UI críticos a personalizar (tablas, formularios, tooltips) y registrar requisitos en la documentación de diseño.

3. **Planificación funcional**
   - Priorizar flujos MVP por módulo apoyándose en los apartados "Flujos clave" de cada documento funcional (`actividades.md`, `consumos.md`, etc.).
   - Mapear dependencias de datos entre módulos y documentar supuestos de integraciones con backend (`api-reference.md`).
   - Definir métricas de éxito iniciales: tiempos de respuesta esperados, cobertura de pruebas, objetivos de performance.

4. **Backlog y herramientas**
   - Configurar tablero (Jira, Linear o similar) con épicas alineadas a cada paso del plan.
   - Convertir el checklist de cada paso en historias o tareas accionables con criterios de aceptación derivados.
   - Establecer la cadencia de ceremonias (dailys, planificaciones, demos) y responsables de documentación.

## Entregables

- Acta de kickoff con alcance confirmado, riesgos y responsables por dominio.
- Documento de decisiones de UX/UI con el tema Material UI acordado y tokens iniciales.
- Backlog inicial priorizado con épicas vinculadas a los pasos de este plan y métricas de éxito definidas.

## Criterios de aceptación

- Todos los integrantes comprenden la arquitectura propuesta y el roadmap de alto nivel.
- Existe un backlog inicial en la herramienta de gestión del proyecto con tareas derivadas del checklist.
- Se cuenta con un diseño base (tokens de color, tipografía) alineado con Material UI y aprobado por stakeholders.
