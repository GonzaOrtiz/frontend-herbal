# Módulo Reportes

## Propósito
Exponer reportes financieros y operativos construidos a partir de agregaciones de costos, consumos, asignaciones y mano de obra. Los servicios aceptan filtros (`periodo`, `producto`, `centro`) y permiten exportar resultados en distintos formatos (JSON por defecto, CSV/XLS mediante el parámetro `format`).【F:src/modules/reportes/controllers/report.controller.ts†L1-L42】【F:src/modules/reportes/services/reports.service.ts†L1-L104】

## Diseño de interfaz general
1. **Menú lateral o pestañas** para seleccionar el tipo de reporte.
2. **Panel de filtros** reutilizable con campos `periodo` (selector de fecha/mes), `producto` (autocompletar) y `centro` según corresponda.
3. **Botones de exportación** (`Descargar CSV`, `Descargar Excel`) que agreguen `?format=csv|xlsx` a la URL.
4. **Visualizaciones** adecuadas a cada reporte (tablas, gráficos, tarjetas de resumen).
5. **Sección de mensajes** para mostrar advertencias si los filtros son insuficientes o la respuesta está vacía.

## Detalle por reporte
| Endpoint | Uso recomendado en UI | Respuesta esperada |
| --- | --- | --- |
| `GET /api/reportes/cif` | Tabla con columnas `producto`, `periodo`, `monto`. Permitir exportación y filtros `producto`/`periodo`. | Agregación de CIF totales filtrados. |
| `GET /api/reportes/consumos` | Tabla de consumos con totales por producto/unidad. Filtros `producto`, `periodo`. | Resultado del pipeline de consumos (suma de cantidades y montos). |
| `GET /api/reportes/asignaciones` | Matriz por centro y actividad mostrando horas y porcentajes. | Datos provenientes de agregación `buildAsignacionPipeline`. |
| `GET /api/reportes/cuadros` | Cards comparativas con `costoDirecto` y `costoIndirecto`. Filtros `producto`, `periodo`. | Arreglo combinando pipelines directos e indirectos.【F:src/modules/reportes/services/reports.service.ts†L28-L57】 |
| `GET /api/reportes/costos` | Vista consolidada con pestañas: costos, consumos, CIF y tarjeta `control` (`totalEgresos`, `totalInsumos`, `consistente`). | JSON `{ costos, consumos, cif, control }`. Manejar bandera `consistente`.【F:src/modules/reportes/services/reports.service.ts†L59-L86】 |
| `GET /api/reportes/comparativo` | Gráfico de barras comparando egresos vs insumos. | `{ totalEgresos, totalInsumos, consistente, diferencia }`.【F:src/modules/reportes/services/reports.service.ts†L88-L100】 |
| `GET /api/reportes/mano-obra` | Tabla por actividad con columnas `actividad`, `descripcion`, `horas`, `monto`. Incluir filtros locales (por actividad) y exportación. | Agregación de horas y sueldos asignados.【F:src/modules/reportes/services/reports.service.ts†L102-L104】 |

### Ejemplo de request/respuesta (reporte de costos)
```http
GET /api/reportes/costos?periodo=2024-05-01&centro=201
Accept: application/json
```
```json
{
  "costos": [
    { "centro": 201, "monto": 48200.75 },
    { "centro": 202, "monto": 27500.1 }
  ],
  "consumos": [
    { "producto": "Queso semiduro", "cantidad": 980.5 }
  ],
  "cif": [
    { "producto": "Queso semiduro", "monto": 185000.75 }
  ],
  "control": {
    "totalEgresos": 75700.85,
    "totalInsumos": 75700.85,
    "consistente": true,
    "diferencia": 0
  }
}
```

## Formularios de filtros
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `periodo` | Selector de mes (YYYY-MM-01) | Opcional; validar formato antes de enviar | Convertir a string ISO; backend convierte a `Date` |
| `producto` | Autocompletar | Opcional | Si se envía vacío, omitir parámetro |
| `centro` | Dropdown numérico | Opcional | Convertir a número antes de enviar |
| `format` | Selector (JSON/CSV/XLSX) | Opcional | Afecta encabezados de respuesta; manejar descarga de archivos |

## Flujo común
1. **Aplicar filtros**: validar en frontend antes de armar query string. El servicio de reportes espera fechas válidas y, en algunos casos, conversión numérica (`centro`).【F:src/modules/reportes/services/reports.service.ts†L59-L73】
2. **Construir request**: usar `fetch`/`axios` con `Accept` adecuado. Para descargas, utilizar `window.open` o solicitar como blob.
3. **Renderizar resultados**: mostrar tablas o gráficos según reporte; en caso de JSON, mapear datos a componentes reutilizables.
4. **Manejo de errores**: capturar respuestas con status 400/500 y mostrar mensajes en la UI. Si el backend devuelve arreglo vacío, mostrar mensajes de “Sin datos”.

## Experiencia de usuario recomendada
- Guardar filtros favoritos por usuario para acelerar consultas frecuentes.
- Mostrar spinners por reporte y permitir ejecutar varios en paralelo (cada uno con su loader).
- Incluir notas explicativas sobre el significado de cada métrica (por ejemplo, `consistente = true` indica que egresos e insumos coinciden dentro del margen tolerado).
