# Paso 6. Costos, asignaciones y consolidaciones

**Objetivo:** Implementar los módulos que calculan, distribuyen y consolidan costos asegurando trazabilidad.

## Actividades principales
- Construir vistas maestro-detalle para Costos, CIF, Asignaciones y Existencias siguiendo `costos.md`, `cif.md` y `existencias.md`.
- Implementar visualizaciones de balances (`debitos`, `creditos`, `balance`) con componentes de Material UI.
- Habilitar procesos de prorrateo y consolidación con diálogos de confirmación y seguimiento de progreso.
- Conectar bitácoras e históricos para auditar `x-user`, `createdAt`, `updatedAt`.
- Añadir pruebas unitarias para lógica de transformación y cálculos presentados al usuario.

## Entregables
- Módulos de Costos y consolidaciones funcionales con manejo de estados de proceso (en ejecución, completado, error).
- Componentes reutilizables para indicadores de balance y timeline de auditoría.
- Documentación de dependencias entre módulos y triggers de sincronización.

## Criterios de aceptación
- Las operaciones largas muestran feedback persistente y permiten reintentos controlados.
- Los datos clave se presentan con formato de moneda y porcentajes consistentes.
- La navegación entre Costos, Existencias y Asientos está enlazada mediante deep-linking.
