# Módulo Centros de Producción

## Propósito
Gestionar los centros productivos utilizados en asignaciones, costos y reportes. Cada centro almacena `nroCentro` (entero positivo y único) y `nombre` (texto obligatorio).【F:src/modules/centro-produccion/entities/centro-produccion.model.ts†L5-L20】

## Diseño de pantalla recomendado
- **Tabla principal** con columnas `nroCentro`, `nombre`, fecha de creación (si se expone) y acciones.
- **Barra de búsqueda** por nombre o número y filtros rápidos (por ejemplo, activos si se amplía en el futuro).
- **Modal de creación** y **drawer de edición** diferenciados para asegurar claridad.
- **Confirmación de eliminación** con resumen de impacto (avisar si el centro está vinculado a asignaciones en el backend cuando se implemente).

## Formularios y validaciones
| Campo | Control | Validaciones en UI | Mensajes sugeridos |
| --- | --- | --- | --- |
| `nroCentro` | Input numérico | Requerido en alta, entero > 0, sin decimales | “El número de centro debe ser un entero positivo” (alineado con backend).【F:src/modules/centro-produccion/controllers/centro-produccion.controller.ts†L24-L55】 |
| `nombre` | Input de texto | Requerido, trim automático, longitud 3-120 | “El nombre es obligatorio” |

### Reglas adicionales
- Normalizar el nombre a `trim` antes de enviarlo, igual que hace el backend.
- Deshabilitar botón de guardar si no hay cambios en edición.
- Mostrar `nroCentro` como solo lectura al editar.

## Flujo operativo
1. **Listar**: al cargar el módulo ejecutar `GET /api/centros-produccion` y mostrar spinner hasta obtener datos.【F:src/modules/centro-produccion/controllers/centro-produccion.controller.ts†L13-L19】
2. **Crear**:
   - Abrir modal, solicitar datos y validar client-side.
   - Enviar `POST /api/centros-produccion` con `{ nombre, nroCentro }`.
   - Manejar errores 400 con mensajes específicos (`El nombre es obligatorio`, `El número de centro es obligatorio`, `El número de centro debe ser un entero positivo`). Mostrar en campos correspondientes.
3. **Editar**:
   - Obtener detalle con `GET /api/centros-produccion/{id}`.
   - Enviar `PUT /api/centros-produccion/{id}` con `{ nombre }` y actualizar tabla.
   - Manejar 404 (`Centro de producción no encontrado`) mostrando alerta y refrescando lista.
4. **Eliminar**:
   - Confirmar con diálogo que incluya `nroCentro` y `nombre`.
   - Ejecutar `DELETE /api/centros-produccion/{id}` y, tras recibir `{ message: 'Centro de producción eliminado con éxito' }`, refrescar datos.

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| GET | `/api/centros-produccion` | — | Lista de centros | — |
| POST | `/api/centros-produccion` | `{ nombre: string, nroCentro: number }` | 201 con centro creado | 400 por validaciones |
| GET | `/api/centros-produccion/{id}` | — | Centro específico | 404 si no existe |
| PUT | `/api/centros-produccion/{id}` | `{ nombre: string }` | Centro actualizado | 404 si no existe |
| DELETE | `/api/centros-produccion/{id}` | — | `{ message: 'Centro de producción eliminado con éxito' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/centros-produccion
Content-Type: application/json

{
  "nroCentro": 150,
  "nombre": "Sala de fraccionamiento"
}
```
```json
{
  "_id": "665ad012b5fb32d21b4f0320",
  "nroCentro": 150,
  "nombre": "Sala de fraccionamiento",
  "__v": 0
}
```

### Experiencia de usuario
- Mostrar badges o etiquetas cuando un centro esté asignado a prorrateos (si el backend expone esa información en el futuro).
- Agregar exportación a CSV del listado filtrado.
- Habilitar acceso rápido desde otros módulos (por ejemplo, desde asignaciones) con deep links.
