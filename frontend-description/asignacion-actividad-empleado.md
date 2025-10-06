# Módulo Asignación Actividad-Empleado

## Propósito
Registrar las horas que cada empleado dedica a actividades específicas y los porcentajes asociados. Cada documento contiene un número de asignación (`nroAsi`), datos del empleado y un arreglo de actividades realizadas con las horas trabajadas y su participación porcentual.【F:src/modules/asignacion-actividad-empleado/entities/asignacion-actividad-empleado.model.ts†L6-L64】

## Diseño de navegación
- **Vista principal** con tabla y filtros persistentes (por empleado, número de asignación o rango de fechas si se agrega metadato). Implementar paginación client-side con tamaños 10/25/50 porque el servicio devuelve el arreglo completo sin parámetros de `limit` o `skip`.
- **Panel maestro-detalle** para creación y edición, idealmente como side sheet para mantener contexto.
- **Sección de métricas rápidas** mostrando total de horas registradas en la búsqueda actual y porcentaje acumulado.
- **Acciones por fila**: editar, duplicar (prellenar nuevo registro con mismas actividades) y eliminar.
- **Buscador global** para localizar rápidamente coincidencias por nombre del empleado o descripción de actividad.

## Componentes y formularios
### Tabla principal
- Columnas sugeridas: `nroAsi`, `empleado.nroEmp`, `empleado.nombre`, total de horas (sumatoria local), cantidad de actividades y acciones.
- Incluir indicador de estado cuando alguna actividad no suma 100 % (cálculo en frontend con color de advertencia).

### Formulario maestro-detalle
| Sección | Campo | Tipo de control | Validaciones | Comentarios |
| --- | --- | --- | --- | --- |
| Datos generales | `nroAsi` | Input numérico | Requerido, entero positivo, validar unicidad contra registros cargados | El backend exige este campo aun cuando la colección maneja `_id` interno.【F:src/modules/asignacion-actividad-empleado/controllers/asignacion-actividad-empleado.controller.ts†L20-L74】 |
| Datos generales | `empleado.nroEmp` | Autocompletar desde catálogo de empleados | Requerido, entero positivo | Mostrar nombre y legajo para selección rápida |
| Datos generales | `empleado.nombre` | Campo de solo lectura | Opcional | Cargar automáticamente tras seleccionar el empleado |
| Actividades realizadas | `actividad.activTrab` | Autocompletar desde `/api/actividades` | Requerido | Mostrar código y nombre |
| Actividades realizadas | `actividad.activDescripcion` | Texto | Requerido, longitud 1-200 | Puede precargarse desde la actividad seleccionada |
| Actividades realizadas | `actividad.porActi` | Input numérico con máscara de porcentaje | Requerido, rango 0-100, permitir dos decimales | Validar suma total <= 100 % |
| Actividades realizadas | `horasTrab` | Input numérico decimal | Requerido, >0, máximo 24 por día (configurable) | Mostrar horas acumuladas |

### Reglas de interacción
- Permitir agregar, reordenar y eliminar filas dinámicamente. Bloquear eliminación si quedaría el arreglo vacío.
- Mostrar un resumen en el pie con total de horas y total de porcentaje asignado.
- Deshabilitar “Guardar” cuando existan validaciones pendientes o la suma de porcentajes exceda 100 %.

## Flujo de usuario
1. **Inicialización**: cargar `GET /api/asignacion-actividad-empleado` y mostrar tabla. Incluir loader y manejo de estados vacíos. Ordenar por `nroAsi` ascendente antes de aplicar paginación en memoria.【F:src/modules/asignacion-actividad-empleado/controllers/asignacion-actividad-empleado.controller.ts†L13-L18】
2. **Filtrado**: aplicar filtros client-side; si el dataset crece, implementar filtros server-side enviando query params (extensión futura).
3. **Creación**:
   - Mostrar formulario vacío con controles descritos.
   - Al enviar, llamar `POST /api/asignacion-actividad-empleado` con payload completo.
   - Manejar errores 400 por campos faltantes o estructura inválida mostrando mensajes específicos.
   - Al éxito (201), cerrar modal, limpiar formulario y refrescar listado.
4. **Edición**:
   - Obtener datos mediante `GET /api/asignacion-actividad-empleado/{id}` y mapear a controles.
   - Al guardar, enviar `PUT /api/asignacion-actividad-empleado/{id}`. Mostrar advertencia si se detectan cambios en `nroAsi` para evitar duplicados.
5. **Eliminación**:
   - Solicitar confirmación contextual con detalle del empleado.
   - Ejecutar `DELETE /api/asignacion-actividad-empleado/{id}` y, al recibir `{ message: 'Asignación eliminada correctamente' }`, actualizar la tabla.

## Integración con API REST
| Método | Endpoint | Cuerpo esperado | Respuesta exitosa | Errores relevantes |
| --- | --- | --- | --- | --- |
| GET | `/api/asignacion-actividad-empleado` | — | `[{ _id, nroAsi, empleado, actividadesRealizadas, __v }]` | — |
| POST | `/api/asignacion-actividad-empleado` | `{ nroAsi, empleado: { nroEmp, nombre? }, actividadesRealizadas: [{ horasTrab, actividad: { activTrab, activDescripcion, porActi } }] }` | 201 con documento creado | 400 si faltan campos o estructura inválida |
| GET | `/api/asignacion-actividad-empleado/{id}` | — | `{ _id, nroAsi, empleado, actividadesRealizadas, __v }` | 404 si el id no existe |
| PUT | `/api/asignacion-actividad-empleado/{id}` | Mismo esquema que POST | Documento actualizado | 400 por validaciones, 404 si no existe |
| DELETE | `/api/asignacion-actividad-empleado/{id}` | — | `{ message: 'Asignación eliminada correctamente' }` | 404 si ya fue eliminada |

### Ejemplo de request/respuesta
```http
POST /api/asignacion-actividad-empleado
Content-Type: application/json

{
  "nroAsi": 1205,
  "empleado": {
    "nroEmp": 45,
    "nombre": "María Figueroa"
  },
  "actividadesRealizadas": [
    {
      "actividad": {
        "activTrab": 8,
        "activDescripcion": "Pasteurización",
        "porActi": 60
      },
      "horasTrab": 6.5
    },
    {
      "actividad": {
        "activTrab": 12,
        "activDescripcion": "Control de calidad",
        "porActi": 40
      },
      "horasTrab": 3.5
    }
  ]
}
```
```json
{
  "_id": "665acd1ab5fb32d21b4efc55",
  "nroAsi": 1205,
  "empleado": {
    "nroEmp": 45,
    "nombre": "María Figueroa"
  },
  "actividadesRealizadas": [
    {
      "actividad": {
        "activTrab": 8,
        "activDescripcion": "Pasteurización",
        "porActi": 60
      },
      "horasTrab": 6.5
    },
    {
      "actividad": {
        "activTrab": 12,
        "activDescripcion": "Control de calidad",
        "porActi": 40
      },
      "horasTrab": 3.5
    }
  ],
  "__v": 0
}
```

### Buenas prácticas UX
- Guardar borradores locales cuando se agregan múltiples actividades y todavía no se envía la asignación.
- Mostrar totales comparativos (horas declaradas vs. horas objetivo) si el negocio lo requiere.
- Incorporar confirmaciones visuales (checklist) para filas validadas correctamente.
