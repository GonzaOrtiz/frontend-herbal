# Módulo Pérdidas

## Propósito
Controlar las mermas registradas por producto, incluyendo grupo, hormas y cantidad en kilogramos. Cada registro guarda la fecha de cálculo (`calculationDate`) para conciliar los periodos y se utiliza en el resumen de existencias.【F:src/modules/perdida/entities/perdida.model.ts†L4-L33】

## Diseño de interfaz
1. **Filtros superiores**: rango de fechas (`FechaPer`), búsqueda por producto y selector de grupo.
2. **Tabla principal** con columnas `FechaPer`, `GRUPO`, `PRODUCTO`, `HORMA`, `CANTIKG`, `calculationDate`, `accessId` si se incorpora, y acciones.
3. **Formulario de alta/edición** en modal con validaciones y previsualización de impacto (cantidad total).
4. **Widget de totales** mostrando suma de `CANTIKG` y `HORMA` en el filtro actual.

## Formularios y validaciones
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `FechaPer` | Selector de fecha | Requerido, formato válido | El backend responde 400 si está ausente o inválido (`La fecha es obligatoria`).【F:src/modules/perdida/controllers/perdida.controller.ts†L31-L47】 |
| `GRUPO` | Texto | Opcional | Puede representarse como dropdown si existe catálogo |
| `PRODUCTO` | Autocompletar / texto | Requerido a nivel negocio (aunque no obligatorio en backend) | Mostrar nombre y código |
| `HORMA` | Número entero | Opcional, >=0 | Validar decimales no permitidos |
| `CANTIKG` | Número decimal | Opcional, >=0 | Mostrar unidad kg |
| `calculationDate` | Selector de fecha | Requerido; precargar con fecha de cálculo activa | Permite asociar periodo |

### Reglas UX
- En edición, convertir `FechaPer` a formato ISO antes de enviar.
- Deshabilitar “Guardar” si no hay cambios.
- Validar en frontend que `HORMA` y `CANTIKG` no sean simultáneamente cero cuando `PRODUCTO` está presente (sugerencia de negocio).

## Flujo funcional
1. **Listar**: ejecutar `GET /api/perdidas` y mostrar tabla. Permitir exportar a CSV.
2. **Crear**:
   - Abrir modal, prellenar `calculationDate` con valor activo.
   - Enviar `POST /api/perdidas` con datos validados. El backend genera `calculationDate` si no se envía (usa fecha actual).
   - Mostrar toast de éxito con datos creados.
3. **Editar**:
   - Obtener registro con `GET /api/perdidas/{id}` (validar ObjectId).【F:src/modules/perdida/controllers/perdida.controller.ts†L19-L27】
   - Enviar `PUT /api/perdidas/{id}` con campos modificados. Manejar errores 400 por ID inválido o fecha malformada y 404 si no existe.【F:src/modules/perdida/controllers/perdida.controller.ts†L49-L60】
4. **Eliminar**:
   - Confirmar acción y ejecutar `DELETE /api/perdidas/{id}`. Manejar 400 por ID inválido y 404 si el registro ya fue eliminado. Mostrar mensaje `{ message: 'Pérdida eliminada correctamente' }`.【F:src/modules/perdida/controllers/perdida.controller.ts†L62-L75】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| GET | `/api/perdidas` | — | Lista de pérdidas | — |
| POST | `/api/perdidas` | `{ FechaPer: 'YYYY-MM-DD', GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate? }` | 201 con registro creado | 400 si falta fecha |
| GET | `/api/perdidas/{id}` | — | Registro solicitado | 400 si id inválido, 404 si no existe |
| PUT | `/api/perdidas/{id}` | Campos modificables | Registro actualizado | 400 por fecha inválida o id incorrecto, 404 si no existe |
| DELETE | `/api/perdidas/{id}` | — | `{ message: 'Pérdida eliminada correctamente' }` | 400 si id inválido, 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/perdidas
Content-Type: application/json

{
  "FechaPer": "2024-05-12",
  "GRUPO": "Maduración",
  "PRODUCTO": "Queso semiduro",
  "HORMA": 8,
  "CANTIKG": 25.5,
  "calculationDate": "2024-05-31"
}
```
```json
{
  "_id": "665ad7c4b5fb32d21b4f0c98",
  "FechaPer": "2024-05-12T00:00:00.000Z",
  "GRUPO": "Maduración",
  "PRODUCTO": "Queso semiduro",
  "HORMA": 8,
  "CANTIKG": 25.5,
  "calculationDate": "2024-05-31T00:00:00.000Z",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Mostrar gráficos de barras por producto o grupo para visualizar tendencias de mermas.
- Permitir duplicar un registro ajustando la fecha para registrar mermas recurrentes.
- Integrar atajos con el módulo de existencias para analizar impacto directo en inventario.
