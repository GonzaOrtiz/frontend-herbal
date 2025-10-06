# Módulo Sobrantes

## Propósito
Registrar productos sobrantes (remanentes) por fecha, grupo, hormas y cantidad en kilogramos, asociando cada registro a una fecha de cálculo para conciliación con existencias.【F:src/modules/sobrante/entities/sobrante.model.ts†L4-L33】

## Diseño de interfaz
1. **Filtros superiores**: rango `FechaSob`, selector de producto y grupo.
2. **Tabla principal** con columnas `FechaSob`, `GRUPO`, `PRODUCTO`, `HORMA`, `CANTIKG`, `calculationDate`, `accessId` si se añade, y acciones.
3. **Formulario de alta/edición** en modal similar al de pérdidas con campos validados.
4. **Tarjeta de totales** para mostrar suma de hormas y kilogramos sobrantes en el rango filtrado.

## Formularios y validaciones
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `FechaSob` | Selector de fecha | Requerido | Backend exige fecha válida; mostrar mensaje si falta |
| `GRUPO` | Texto / dropdown | Opcional | Permite agrupar productos |
| `PRODUCTO` | Autocompletar / texto | Opcional (recomendado obligatorio a nivel negocio) | |
| `HORMA` | Número entero | Opcional, >=0 | Validar que no acepte decimales |
| `CANTIKG` | Número decimal | Opcional, >=0 | Mostrar unidad kg |
| `calculationDate` | Selector de fecha | Requerido, prellenar con fecha de cálculo activa | El backend asigna fecha actual si se omite.【F:src/modules/sobrante/controllers/sobrante.controller.ts†L10-L17】 |

### Reglas UX
- Deshabilitar envío si `FechaSob` está vacío.
- Mostrar badge “Calculado en {calculationDate}` para reforzar periodo.
- Permitir duplicar registro cambiando únicamente la fecha.

## Flujo funcional
1. **Listar**: ejecutar `GET /api/sobrantes` y mostrar tabla. Permitir exportar resultados.
2. **Crear**: completar formulario y enviar `POST /api/sobrantes`. Mostrar mensaje de éxito con los datos retornados.【F:src/modules/sobrante/controllers/sobrante.controller.ts†L10-L17】
3. **Editar**: abrir modal con datos existentes y enviar `PUT /api/sobrantes/{id}`. Manejar 404 (`Sobrante no encontrado`).【F:src/modules/sobrante/controllers/sobrante.controller.ts†L23-L32】
4. **Eliminar**: confirmar y ejecutar `DELETE /api/sobrantes/{id}`. Mostrar `{ message: 'Sobrante eliminado con éxito' }`.【F:src/modules/sobrante/controllers/sobrante.controller.ts†L34-L38】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| POST | `/api/sobrantes` | `{ FechaSob, GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate? }` | 201 con registro creado | Validar datos en UI |
| GET | `/api/sobrantes` | — | Lista de sobrantes | — |
| PUT | `/api/sobrantes/{id}` | Campos modificables | Registro actualizado | 404 si no existe |
| DELETE | `/api/sobrantes/{id}` | — | `{ message: 'Sobrante eliminado con éxito' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/sobrantes
Content-Type: application/json

{
  "FechaSob": "2024-05-14",
  "GRUPO": "Empaque",
  "PRODUCTO": "Queso semiduro",
  "HORMA": 4,
  "CANTIKG": 12.3,
  "calculationDate": "2024-05-31"
}
```
```json
{
  "_id": "665ada8fb5fb32d21b4f0f5e",
  "FechaSob": "2024-05-14T00:00:00.000Z",
  "GRUPO": "Empaque",
  "PRODUCTO": "Queso semiduro",
  "HORMA": 4,
  "CANTIKG": 12.3,
  "calculationDate": "2024-05-31T00:00:00.000Z",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Integrar gráficos que muestren distribución de sobrantes por producto.
- Permitir filtros rápidos (chips) por grupo.
- Mostrar advertencia cuando `CANTIKG` y `HORMA` sean cero para solicitar confirmación.
