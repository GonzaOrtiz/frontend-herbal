# Módulo Litros de Crema

## Propósito
Gestionar los registros de litros destinados a crema importados desde Access, permitiendo reprocesar datos por fecha, listar registros existentes y corregir manualmente valores cuando sea necesario.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L1-L43】【F:src/modules/litroscrema/entities/litroscrema.model.ts†L4-L33】

## Diseño de pantalla
1. **Encabezado con filtros**: selector de rango de fechas (`Fechalitro`) y búsqueda por producto.
2. **Tabla principal** con columnas `Fechalitro`, `Producto`, `Monto`, `accessId`, fecha de importación y acciones.
3. **Panel de reproceso**: formulario simple para volver a importar datos desde Access según fecha indicada.
4. **Formulario de edición** (modal) que permita ajustar `Producto` y `Monto` manualmente.
5. **Indicadores**: mostrar badge “Importado” cuando `accessId` esté presente.

## Formularios y validaciones
### Reprocesar datos
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `fecha` | Selector de fecha | Requerido | El backend responde 400 (`La fecha es obligatoria`) si falta.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L10-L21】 |

### Edición manual
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `Fechalitro` | Fecha | Read-only (recomendado) | Mantener fecha original |
| `Producto` | Texto | Opcional pero recomendable validar longitud | |
| `Monto` | Número decimal | Validar ≥0 | Representa cantidad o monto asociado |
| `accessId` | Texto | Read-only | Identificador de origen; mantener para idempotencia |

## Flujo funcional
1. **Reprocesar**: el usuario ingresa fecha y ejecuta `POST /api/litros-crema`. Mostrar spinner y mensaje de éxito `{ message: 'Litros de crema registrados' }` cuando finalice.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L10-L21】
2. **Listar**: cargar tabla con `GET /api/litros-crema`. Permitir ordenamiento por fecha y exportación a CSV.
3. **Editar**: abrir modal con datos existentes y enviar `PUT /api/litros-crema/{id}` con campos modificados. Manejar 404 (`Litros de crema no encontrados`).【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L23-L34】
4. **Eliminar**: solicitar confirmación y ejecutar `DELETE /api/litros-crema/{id}`. Mostrar mensaje `{ message: 'Litros de crema eliminados' }`.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L36-L43】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| POST | `/api/litros-crema` | `{ fecha: 'YYYY-MM-DD' }` | 201 con mensaje | 400 si falta fecha |
| GET | `/api/litros-crema` | — | `[ { _id, Fechalitro, Producto, Monto, accessId } ]` | — |
| PUT | `/api/litros-crema/{id}` | Campos modificados | Registro actualizado | 404 si no existe |
| DELETE | `/api/litros-crema/{id}` | — | `{ message: 'Litros de crema eliminados' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/litros-crema
Content-Type: application/json

{
  "fecha": "2024-05-01"
}
```
```json
{
  "message": "Litros de crema registrados"
}
```

### Experiencia de usuario recomendada
- Mostrar totales de litros por rango de fecha seleccionado.
- Permitir exportar los resultados a Excel para reportes de producción.
- Incluir validación que evite reprocesar dos veces la misma fecha consecutivamente sin confirmación.
