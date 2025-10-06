# Módulo de Actividades

## Propósito
Gestiona el catálogo maestro de actividades productivas utilizadas en las asignaciones de horas y costos. Cada registro posee un número correlativo (`nroAct`) generado automáticamente por el backend y un nombre único que identifica la tarea.【F:src/modules/actividad/entities/actividad.model.ts†L5-L17】【F:src/modules/actividad/services/ActividadService.ts†L13-L36】

## Diseño de pantalla recomendado
- **Encabezado con búsqueda**: incluir un campo de búsqueda rápida por nombre que filtre en memoria los resultados cargados.
- **Tabla principal**:
  - Columnas: `nroAct`, `nombre`, fecha de creación (si se muestra metadato) y columna de acciones.
  - Habilitar ordenamiento por `nroAct` y `nombre`.
  - Mostrar vacíos con un mensaje amigable cuando no existan actividades.
- **Acciones**:
  - Botón primario “Nueva actividad” que abra un modal o panel lateral.
  - Iconos de edición y eliminación por fila con tooltips descriptivos.
- **Alertas y feedback**:
  - Mostrar toasts para operaciones exitosas y mensajes de error provenientes de la API.
  - Deshabilitar acciones mientras se envían solicitudes para evitar duplicados.

## Formulario y validaciones
| Campo | Tipo de control | Fuente de datos | Validaciones en UI | Observaciones |
| --- | --- | --- | --- | --- |
| `nombre` | Input de texto (máximo 120 caracteres) | Ingreso manual | Requerido, sin espacios iniciales/finales, prohibir duplicados client-side si el nombre ya existe en la tabla | El `nroAct` se calcula en backend, solo mostrarlo como lectura en edición |

### Comportamiento del formulario
1. Mostrar cabecera con título contextual (“Crear actividad” o “Editar actividad”).
2. Visualizar `nroAct` únicamente en edición como campo bloqueado.
3. Validar en vivo (on blur) que `nombre` no esté vacío y eliminar espacios innecesarios.
4. Deshabilitar botón “Guardar” hasta que el formulario sea válido.
5. Ante errores 400 (`{ message: 'El nombre es obligatorio' }`) mostrar mensaje asociado al campo.【F:src/modules/actividad/controllers/actividad.controller.ts†L21-L55】

## Flujo de usuario
1. **Listar**: llamar `GET /api/actividades` al cargar la pantalla. Presentar spinner mientras se obtiene la información y actualizar la tabla ordenada por `nroAct` ascendente.【F:src/modules/actividad/services/ActividadService.ts†L13-L16】
2. **Crear**:
   - Abrir el formulario vacío y requerir `nombre`.
   - Al enviar, llamar `POST /api/actividades` con `{ "nombre": "Texto" }`.
   - Si la respuesta es 201, cerrar el formulario, refrescar la lista y mostrar toast de confirmación.
3. **Editar**:
   - Obtener datos mediante `GET /api/actividades/{id}` (el `id` es de MongoDB) y precargar el formulario.
   - Enviar cambios con `PUT /api/actividades/{id}` incluyendo los campos modificados.
4. **Eliminar**:
   - Solicitar confirmación mostrando el nombre de la actividad.
   - Ejecutar `DELETE /api/actividades/{id}` y, al recibir `{ message: 'Actividad eliminada con éxito' }`, actualizar el listado.

## Integración con API REST
| Método | Endpoint | Cuerpo de solicitud | Respuesta exitosa (200/201) | Errores comunes |
| --- | --- | --- | --- | --- |
| GET | `/api/actividades` | — | `[{ _id, nroAct, nombre, __v }]` | — |
| POST | `/api/actividades` | `{ "nombre": string }` | `{ _id, nroAct, nombre, __v }` | 400 si falta `nombre` |
| GET | `/api/actividades/{id}` | — | `{ _id, nroAct, nombre, __v }` | 404 si no existe |
| PUT | `/api/actividades/{id}` | `{ "nombre": string }` | `{ _id, nroAct, nombre, __v }` | 404 si no existe |
| DELETE | `/api/actividades/{id}` | — | `{ "message": "Actividad eliminada con éxito" }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/actividades
Content-Type: application/json

{
  "nombre": "Revisión de calderas"
}
```
```json
{
  "_id": "665accc1b5fb32d21b4efc10",
  "nroAct": 14,
  "nombre": "Revisión de calderas",
  "__v": 0
}
```

### Manejo de estados vacíos y errores
- Si la respuesta de listado es un arreglo vacío, mostrar mensaje “No hay actividades registradas”.
- Para errores de red, ofrecer botón de reintento.
- Registrar validaciones que eviten duplicar solicitudes al hacer clic varias veces en “Guardar”.
