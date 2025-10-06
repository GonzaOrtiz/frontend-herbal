# Módulo Centro de Apoyo

## Propósito
Administrar los centros de apoyo y consultar los gastos asociados en un período determinado. Cada centro posee `nroCentro` y `nombre` únicos; la información de gastos se obtiene a partir de procesos de prorrateo y gastos operativos específicos.【F:src/modules/centro-apoyo/entities/centro-apoyo.model.ts†L5-L20】【F:src/modules/centro-apoyo/services/index.ts†L1-L16】

## Diseño de interfaz
1. **Listado maestro** con tabla de centros (columnas `nroCentro`, `nombre`, `fechaActualizacion` si el backend la expone, acciones).
2. **Panel de edición** accesible desde la tabla para cambiar únicamente el `nombre`.
3. **Vista de gastos** en panel lateral o pestaña adicional con filtros por `fechaCalculo` y `esGastoDelPeriodo`.
4. **Tarjetas resumen** en la vista de gastos mostrando totales por categoría (energía, caldera, refrigeración, etc.).

## Formularios y validaciones
| Sección | Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- | --- |
| Edición de centro | `nroCentro` | Campo de solo lectura | — | Mostrar como etiqueta destacada |
|  | `nombre` | Input de texto | Requerido, longitud 3-120, evitar duplicados | El backend valida existencia y devuelve 404 si no encuentra el registro.【F:src/modules/centro-apoyo/controllers/centro-apoyo.controller.ts†L22-L34】 |
| Filtros de gastos | `fechaCalculo` | Selector de fecha (YYYY-MM-DD) | Opcional | Enviar vacío para obtener historial completo |
|  | `esGastoDelPeriodo` | Checkbox / toggle | Opcional | Convertir a string `true`/`false` al llamar API |

### Reglas UX
- Mostrar mensajes claros para errores de actualización (404) indicando que el centro no existe.
- Persistir la selección de filtros de gastos entre sesiones (local storage).
- Incluir botón “Limpiar filtros” en la vista de gastos.

## Flujo funcional
1. **Cargar centros**: `GET /api/centros-apoyo` al ingresar al módulo. Mostrar loader y estado vacío amigable.【F:src/modules/centro-apoyo/controllers/centro-apoyo.controller.ts†L10-L18】
2. **Editar centro**:
   - Seleccionar fila, abrir panel y precargar datos vía `GET /api/centros-apoyo/{id}`.
   - Permitir modificar sólo el `nombre` y enviar `PUT /api/centros-apoyo/{id}`. Deshabilitar botón de guardar si el campo no cambió.
   - Mostrar toast de éxito cuando el backend devuelva el objeto actualizado.
3. **Consultar gastos**:
   - Exigir al usuario seleccionar al menos `fechaCalculo` para acotar resultados cuando se espere mucho volumen.
   - Ejecutar `GET /api/centros-apoyo/gastos?fechaCalculo=YYYY-MM-DD&esGastoDelPeriodo=true|false` según filtros.
   - Renderizar tabla con columnas `concepto`, `monto`, `esGastoDelPeriodo` y permitir exportar a CSV.

## Integración con API REST
| Método | Endpoint | Parámetros / cuerpo | Respuesta | Errores comunes |
| --- | --- | --- | --- | --- |
| GET | `/api/centros-apoyo` | — | `[{ _id, nroCentro, nombre, __v }]` | — |
| GET | `/api/centros-apoyo/{id}` | — | Detalle del centro | 404 si no existe |
| PUT | `/api/centros-apoyo/{id}` | `{ nombre: string }` | Centro actualizado | 404 si no existe |
| GET | `/api/centros-apoyo/gastos` | Query `fechaCalculo`, `esGastoDelPeriodo` | Arreglo de gastos consolidados | — |

### Ejemplo de request/respuesta (gastos)
```http
GET /api/centros-apoyo/gastos?fechaCalculo=2024-05-31&esGastoDelPeriodo=true
Accept: application/json
```
```json
[
  {
    "concepto": "Energía eléctrica",
    "monto": 18250.45,
    "esGastoDelPeriodo": true,
    "centro": "Calderas"
  },
  {
    "concepto": "Mantenimiento",
    "monto": 6200.0,
    "esGastoDelPeriodo": true,
    "centro": "Refrigeración"
  }
]
```

### Experiencia de usuario recomendada
- Agregar gráfico de barras o donut para visualizar participación de cada tipo de gasto.
- Permitir exportar los gastos filtrados a Excel.
- Mostrar advertencias cuando la respuesta esté vacía para orientar al usuario (por ejemplo “No se encontraron gastos para el período seleccionado”).
