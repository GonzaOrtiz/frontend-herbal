# Módulo Empleados

## Propósito
Mantener el catálogo de empleados utilizado en asignaciones de actividades y en el módulo de sueldos. Cada registro posee un número consecutivo (`Nroem`) generado automáticamente y un nombre (`Empleado`). El servicio expone el campo `nombre` normalizado para el frontend.【F:src/modules/empleado/entities/empleado.model.ts†L5-L19】【F:src/modules/empleado/services/EmpleadoService.ts†L13-L48】

## Diseño de pantalla
- **Tabla principal** con columnas `Nroem`, `nombre`, fecha de creación (si se expone) y acciones.
- **Búsqueda** por número o nombre, con opción de filtrar por coincidencia parcial.
- **Modal de alta** simple con dos campos.
- **Drawer de edición** que solo permite modificar el nombre.
- **Confirmación de baja** que advierta el impacto en asignaciones/sueldos vinculados.

## Formulario de alta/edición
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `Nroem` | Campo de solo lectura en creación (se muestra sugerido tras guardar) | — | El backend calcula automáticamente el correlativo. |
| `nombre` | Input de texto | Requerido, longitud 3-120, trim automático | El backend devuelve 400 si falta (`El nombre es obligatorio`).【F:src/modules/empleado/controllers/empleado.controller.ts†L23-L45】 |

### Reglas UX
- Deshabilitar botón de guardar hasta que el formulario sea válido.
- En edición, solo permitir cambiar el nombre; mostrar `Nroem` como read-only.
- Ante error 404 al editar/eliminar, mostrar alerta y refrescar tabla (el registro pudo ser eliminado por otro usuario).

## Flujo de usuario
1. **Listar**: al ingresar llamar `GET /api/empleados`. Mostrar loader y estado vacío amistoso.【F:src/modules/empleado/controllers/empleado.controller.ts†L12-L15】
2. **Crear**:
   - Abrir modal, solicitar nombre y validar.
   - Enviar `POST /api/empleados` con `{ nombre }`.
   - Mostrar toast con `Empleado creado` y refrescar listado.
3. **Editar**:
   - Obtener datos via `GET /api/empleados/{id}`.
   - Enviar `PUT /api/empleados/{id}` con `{ nombre }`.
   - Manejar 404 mostrando mensaje “Empleado no encontrado”.
4. **Eliminar**:
   - Confirmar acción, ejecutar `DELETE /api/empleados/{id}`.
   - Mostrar mensaje de éxito `{ message: 'Empleado eliminado correctamente' }`.

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| GET | `/api/empleados` | — | Lista de empleados (`{ _id, Nroem, nombre }`) | — |
| POST | `/api/empleados` | `{ nombre: string }` | 201 con empleado creado | 400 si falta nombre |
| GET | `/api/empleados/{id}` | — | Detalle del empleado | 404 si no existe |
| PUT | `/api/empleados/{id}` | `{ nombre: string }` | Empleado actualizado | 400 si falta nombre, 404 si no existe |
| DELETE | `/api/empleados/{id}` | — | `{ message: 'Empleado eliminado correctamente' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/empleados
Content-Type: application/json

{
  "nombre": "Lucía Paredes"
}
```
```json
{
  "_id": "665ad4f6b5fb32d21b4f08d3",
  "Nroem": 87,
  "nombre": "Lucía Paredes",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Mostrar contador de empleados y botón “Exportar” (CSV/Excel).
- Permitir duplicar un registro para generar un nuevo empleado con nombre similar (limpiando `Nroem`).
- Integrar accesos rápidos desde otros módulos para buscar un empleado y abrir su ficha.
