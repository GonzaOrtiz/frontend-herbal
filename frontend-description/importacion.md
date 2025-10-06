# Módulo Importación MDB

## Propósito
Cargar archivos Access (`.mdb`) y distribuir su información entre los diferentes módulos del sistema (costos, insumos, ventas, pérdidas, etc.), dejando registros de auditoría en la colección de bitácoras. También permite administrar manualmente estos logs (crear, editar, eliminar).【F:src/modules/importaciones/controllers/importaciones.controller.ts†L1-L198】【F:src/modules/importaciones/routes/importaciones.routes.ts†L1-L41】

## Diseño de interfaz
1. **Formulario de carga** destacado con arrastrar y soltar para archivos `.mdb`, selector de fecha de importación y botón “Procesar”.
2. **Panel de progreso** que muestre estado (“Analizando”, “Procesando tabla X”, “Completado”) y barra porcentual.
3. **Resumen de resultados** en tabla con columnas `table`, `collection`, `inserted`, `error`.
4. **Historial de importaciones** con filtros por rango de fechas y campo de búsqueda por nombre de archivo.
5. **Detalle de bitácora** en panel lateral con posibilidad de editar comentarios o eliminar registro.

## Formularios y validaciones
### Carga de archivo
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `mdbFile` | Input de archivo | Requerido, aceptar solo `.mdb` | Validar tamaño máximo (según política, sugerido < 50 MB) |
| `fechaImportacion` | Selector de fecha | Requerido | El backend usa esta fecha para procesar registros y validar duplicados (`Ya se realizó una importación...`).【F:src/modules/importaciones/controllers/importaciones.controller.ts†L37-L80】 |

### Bitácoras manuales (`/api/importaciones`)
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `fileName` | Texto | Requerido | Nombre de archivo importado |
| `importDate` | Fecha | Requerido | Fecha asociada |
| `recordsProcessed` | Número entero | Requerido, ≥0 | |
| `durationMs` | Número entero | Opcional | Duración en milisegundos |
| `errorMessages` | Textarea / lista | Opcional | Guardar arreglo de strings |

## Flujo de importación
1. **Selección**: el usuario selecciona archivo y fecha. Validar en UI y habilitar botón “Procesar”.
2. **Carga**: enviar `POST /import` con `FormData` (campos `mdbFile` y `fechaImportacion`). Mostrar indicador de carga mientras el backend procesa tablas en lotes de 500 registros.【F:src/modules/importaciones/controllers/importaciones.controller.ts†L82-L150】
3. **Resultado**:
   - Recibir respuesta con `results` (array de `{ table, collection, inserted, error? }`). Renderizar tabla ordenada por tabla.
   - Si el backend devuelve 409 (ya importado), mostrar alerta y opción de revisar historial.
   - Mostrar totales agregados (insertados vs errores) y botón “Ver detalle” para cada tabla.
4. **Post-proceso**: refrescar historial con `GET /api/importaciones` para incluir la nueva bitácora creada automáticamente (documento `ImportLog`).

## Gestión de bitácoras
- **Listado**: `GET /api/importaciones` con paginación y filtros por fecha.
- **Detalle**: `GET /api/importaciones/{id}` para ver información completa (usar ObjectId válido). Backend retorna 404 si no existe.
- **Creación manual**: `POST /api/importaciones` con campos mencionados.
- **Actualización**: `PUT /api/importaciones/{id}` permite modificar campos; validar en UI que al menos uno haya cambiado.
- **Eliminación**: `DELETE /api/importaciones/{id}` con confirmación. Mostrar mensaje de éxito y refrescar listado.【F:src/modules/importaciones/routes/importaciones.routes.ts†L24-L39】

## Endpoints principales
| Método | Endpoint | Uso | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/import` | Procesar archivo `.mdb` | `{ results: TableResult[], totalRecords }` | Responder errores específicos por tabla |
| GET | `/api/importaciones` | Listar bitácoras | `[ImportLog]` | Permitir filtros en query (ampliable) |
| GET | `/api/importaciones/{id}` | Obtener detalle | `ImportLog` | 404 si no existe |
| POST | `/api/importaciones` | Crear bitácora manual | `ImportLog` creado | Validar campos requeridos |
| PUT | `/api/importaciones/{id}` | Actualizar bitácora | `ImportLog` actualizado | Enviar solo campos modificados |
| DELETE | `/api/importaciones/{id}` | Eliminar bitácora | `{ message: 'Registro eliminado con éxito' }` | Confirmar antes de ejecutar |

### Ejemplo de request/respuesta (carga de archivo)
```http
POST /import
Content-Type: multipart/form-data; boundary=----boundary
x-user: cvaldez

------boundary
Content-Disposition: form-data; name="mdbFile"; filename="costos_mayo.mdb"
Content-Type: application/octet-stream

<archivo binario>
------boundary
Content-Disposition: form-data; name="fechaImportacion"

2024-05-31
------boundary--
```
```json
{
  "totalRecords": 12450,
  "results": [
    { "table": "COSTOS", "collection": "costos", "inserted": 3200, "error": null },
    { "table": "PRODUCCION", "collection": "producciones", "inserted": 2800, "error": null },
    { "table": "SOBRANTES", "collection": "sobrantes", "inserted": 150, "error": "Duplicado accessId" }
  ]
}
```

### Experiencia de usuario recomendada
- Al finalizar, ofrecer enlace directo a módulos afectados (Costos, Insumos, Ventas) para revisar datos importados.
- Guardar preferencias del usuario (última ruta seleccionada, recordar fecha) en almacenamiento local.
- Registrar notificaciones en tiempo real si el procesamiento se ejecuta en background prolongado (mostrar estado “En progreso”).
