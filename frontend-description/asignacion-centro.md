# Módulo Asignación de Centros

## Propósito
Define cómo se distribuyen los costos de un centro hacia otros destinos o bases. Cada registro contiene el número de asignación (`numero`), el centro origen (`nCentro`) y una lista de líneas con base asignable, centro destino y porcentaje aplicable.【F:src/modules/asignacion-centro/entities/asignacion-centro.model.ts†L5-L31】

## Diseño de pantalla recomendado
- **Panel principal** con filtro por número de centro y buscador por `numero` de asignación.
- **Tabla resumen** mostrando columnas `numero`, `nCentro`, cantidad de destinos configurados, suma de porcentajes y acciones.
- **Indicadores** que alerten cuando la suma de porcentajes no alcance el 100 % o lo supere.
- **Botón “Nueva distribución”** que abra formulario maestro-detalle en modal o drawer.

## Formularios y validaciones
| Sección | Campo | Tipo | Validaciones de UI | Comentarios |
| --- | --- | --- | --- | --- |
| Datos generales | `numero` | Input numérico | Requerido en creación, entero positivo, validar unicidad | Mostrar como solo lectura en edición |
| Datos generales | `nCentro` | Autocompletar desde `/api/centros-produccion` | Requerido | Mostrar nombre y código del centro seleccionado |
| Líneas de asignación | `base` | Input numérico decimal | Requerido, >=0, permitir 2 decimales | Representa monto base para distribuir |
| Líneas de asignación | `centroDestino` | Autocompletar | Opcional según regla de negocio, validar si porcentaje >0 | Cargar catálogo de centros |
| Líneas de asignación | `porcentaje` | Input porcentaje | Opcional pero recomendado, rango 0-100, máximo dos decimales | Validar suma total <= 100 % |

### Reglas de interacción del detalle
- Debe existir al menos una línea con `base` válida antes de permitir guardar.【F:src/modules/asignacion-centro/controllers/asignacion-centro.controller.ts†L26-L46】
- Permitir duplicar filas y reordenarlas.
- Mostrar total acumulado de porcentajes y total de bases para revisión rápida.
- Habilitar botón “Agregar fila” que cree un registro vacío con foco en `centroDestino`.

## Flujo operativo
1. **Listado inicial**: consumir `GET /api/asignacion-centro` y renderizar tabla ordenada por `numero`. Mostrar loader y estado vacío personalizado.【F:src/modules/asignacion-centro/controllers/asignacion-centro.controller.ts†L13-L24】
2. **Creación**:
   - Abrir formulario limpio.
   - Validar que se haya elegido `nCentro` y que exista al menos una fila con `base` numérica.
   - Enviar `POST /api/asignacion-centro` con `{ nCentro, asignacion: [...] }`.
   - Al recibir 201, cerrar modal, refrescar listado y mostrar toast de éxito.
3. **Edición**:
   - Obtener datos con `GET /api/asignacion-centro/{id}`.
   - Permitir editar `nCentro` y detalle; `numero` debería mostrarse bloqueado.
   - Guardar cambios mediante `PUT /api/asignacion-centro/{id}`.
4. **Eliminación**:
   - Solicitar confirmación textual indicando `numero` y `nCentro`.
   - Ejecutar `DELETE /api/asignacion-centro/{id}` y actualizar listado al recibir `{ message: 'Asignación eliminada correctamente' }`.

## Integración con API REST
| Método | Endpoint | Payload ejemplo | Respuesta exitosa | Errores a manejar |
| --- | --- | --- | --- | --- |
| GET | `/api/asignacion-centro` | — | `[{ _id, numero, nCentro, asignacion: [{ base, centroDestino, porcentaje }], __v }]` | — |
| POST | `/api/asignacion-centro` | `{ "nCentro": 101, "asignacion": [{ "base": 5000, "centroDestino": 201, "porcentaje": 60 }] }` | 201 con documento creado | 400 si el arreglo es vacío o falta `base` |
| GET | `/api/asignacion-centro/{id}` | — | Documento con el detalle | 404 si no existe |
| PUT | `/api/asignacion-centro/{id}` | Mismo esquema que POST más `numero` si se decide permitir cambiarlo | Documento actualizado | 404 si no existe |
| DELETE | `/api/asignacion-centro/{id}` | — | `{ "message": "Asignación eliminada correctamente" }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/asignacion-centro
Content-Type: application/json

{
  "nCentro": 101,
  "asignacion": [
    { "base": 5000, "centroDestino": 201, "porcentaje": 60 },
    { "base": 5000, "centroDestino": 202, "porcentaje": 40 }
  ]
}
```
```json
{
  "_id": "665ace43b5fb32d21b4efd11",
  "numero": 57,
  "nCentro": 101,
  "asignacion": [
    { "base": 5000, "centroDestino": 201, "porcentaje": 60 },
    { "base": 5000, "centroDestino": 202, "porcentaje": 40 }
  ],
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Colorear porcentajes con semáforos (verde = 100 %, amarillo <100 %, rojo >100 %).
- Mostrar tooltip explicando la lógica de distribución.
- Registrar historial local de cambios para permitir “Deshacer” antes de guardar.
