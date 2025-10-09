# Guía rápida de reportes y analítica

Esta guía complementa el módulo de reportes del frontend. Resume los indicadores clave, los filtros sugeridos y la forma de interpretar cada visualización disponible.

## Reportes financieros

### Costos consolidados (`GET /api/reportes/costos`)
- **Qué muestra:** Totales de costos por centro, consumos por producto y CIF agregados.
- **Filtros recomendados:** `periodo` (obligatorio para comparativos), `centro` cuando se requiere auditar un área específica.
- **KPIs:**
  - *Total egresos* y *total insumos* deben mantenerse alineados; la tarjeta de consistencia refleja el estado (`consistente`).
  - *Diferencia* muestra desviaciones absolutas y destaca variaciones mayores al 5 %.
- **Uso sugerido:** Antes de cerrar el mes valida que la tarjeta de consistencia permanezca en verde. Si aparecen alertas, navega a Costos → Gastos para identificar movimientos anómalos.

### Comparativo egresos vs insumos (`GET /api/reportes/comparativo`)
- **Qué muestra:** Diferencia entre egresos e insumos del periodo en un gráfico de barras.
- **Interpretación:**
  - *Diferencia* se expresa en moneda y porcentaje sobre egresos.
  - El estatus indica si la diferencia está dentro del margen permitido por control interno.
- **Buenas prácticas:** Comparte el deep-link con el área financiera cuando detectes una desviación para que confirmen ajustes de CIF.

### CIF por producto (`GET /api/reportes/cif`)
- **Qué muestra:** Monto de costos indirectos aplicados a cada producto por periodo.
- **Notas:** Ideal para revisar tendencias de productos críticos; exporta a Excel para cruzar con presupuestos.

## Reportes operativos

### Consumos consolidados (`GET /api/reportes/consumos`)
- **Descripción:** Tabla con cantidades y montos por producto/unidad.
- **Indicadores:** Cantidades mostradas con dos decimales para detectar variaciones ligeras.
- **Recomendación:** Usa `producto` y `periodo` para revisar lotes específicos cuando surgen sobrantes.

### Asignaciones por centro (`GET /api/reportes/asignaciones`)
- **Descripción:** Horas y porcentajes distribuidos por centro y actividad.
- **Interpretación:**
  - Las columnas de porcentaje permiten validar si la distribución respeta las reglas de `frontend-description/asignaciones.md`.
  - Si se detectan porcentajes fuera del rango esperado, revisar la bitácora de asignaciones.

### Mano de obra (`GET /api/reportes/mano-obra`)
- **Descripción:** Horas y monto asignado por actividad de producción.
- **Uso recomendado:** Exporta cuando Recursos Humanos solicite conciliaciones con nómina; comparte el deep-link junto a los filtros aplicados.

## Auditoría y descargas

### Bitácora de exportaciones (`GET /api/reportes/descargas`)
- **Qué registra:** Reporte descargado, formato, filtros, usuario y estatus de la exportación.
- **KPIs:** Número de descargas exitosas y fallidas por día.
- **Buenas prácticas:**
  - Mantén la bitácora visible al momento de generar reportes para documentar quién compartió cada archivo.
  - Si hay descargas fallidas consecutivas, revisa el límite de filas (50 000) o ajusta filtros.

## Accesibilidad y rendimiento
- Todos los gráficos incluyen descripción textual y colores con contraste AA (paleta azul turquesa).
- Las tablas usan filas de subtotal y estado vacío accesible con `role="status"`.
- Los loaders skeleton reducen cambios bruscos mientras se obtienen datos.
- Comparte vistas copiando el enlace desde el panel de filtros; las combinaciones se almacenan como presets reutilizables.

## Flujo recomendado para usuarios finales
1. Selecciona el **periodo** y, de ser necesario, `producto` o `centro`.
2. Verifica que la alerta de filtros indique una combinación válida.
3. Revisa tarjetas y tablas; si detectas anomalías, ajusta filtros.
4. Utiliza la barra de exportación para generar CSV/Excel y confirma en la bitácora que la descarga se registró.
5. Guarda un preset con los filtros críticos para reutilizarlos en el próximo cierre.
