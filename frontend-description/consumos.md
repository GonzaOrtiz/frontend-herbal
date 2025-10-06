# Módulo Consumos

## Propósito
Registrar consumos de insumos por producto y fecha, permitiendo crear, consultar, actualizar y eliminar registros provenientes de procesos manuales o de importación. El DTO de validación aplica reglas estrictas sobre fechas ISO, números no negativos y cadenas no vacías.【F:src/modules/consumo/dto/consumo.dto.ts†L1-L88】

## Diseño de interfaz sugerido
1. **Encabezado de filtros** con campos `producto`, rango de fechas (`desde`, `hasta`) y botón “Buscar”. Incluir opción “Últimos 30 días”.
2. **Tabla principal** paginada con columnas: `producto`, `insumo`, `cantidad`, `unidad`, `tipoProd`, `fecha`, `calculationDate`, `accessId`, `usuario` (si se captura en cabecera), acciones.
3. **Panel de creación/edición** con formulario estructurado y sección de auditoría (mostrar `accessId`, `calculationDate`).
4. **Resumen lateral** mostrando totales por insumo o por producto según filtros aplicados.

## Formularios y validaciones
| Campo | Control | Validaciones UI | Notas |
| --- | --- | --- | --- |
| `producto` | Autocompletar / texto | Requerido, sin espacios vacíos | Puede mapearse al catálogo de productos |
| `insumo` | Autocompletar / texto | Requerido | Se recomienda autocompletar desde catálogo de insumos |
| `cantidad` | Input numérico | Requerido, >=0, permitir 3 decimales | Mostrar unidad al costado |
| `unidad` | Texto corto | Requerido | Validar longitud máxima (5-10 caracteres) |
| `tipoProd` | Dropdown opcional | Opcional, validar no vacío si se selecciona | |
| `fecha` | Selector de fecha | Requerido, convertir a ISO | Backend valida formato y transforma a ISO string |
| `calculationDate` | Selector de fecha | Opcional, convertir a ISO | Si se omite, backend usa fecha actual.【F:src/modules/consumo/controllers/consumo.controller.ts†L13-L23】 |
| `accessId` | Texto | Opcional | Útil para trazabilidad de importaciones |

### Reglas para actualización
- `update` permite modificar `producto`, `insumo`, `cantidad`, `unidad`, `tipoProd` y `fecha`. Debe enviarse al menos un campo (aparte de `accessId`); de lo contrario el backend responde 400 con mensaje `Debe proporcionar al menos un campo modificable`.【F:src/modules/consumo/dto/consumo.dto.ts†L56-L78】
- `calculationDate` no es editable desde la API de update; se mantiene el valor original.
- Enviar cabecera `x-user` en PUT/DELETE para auditoría.【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】

## Flujo de usuario
1. **Inicialización**: precargar filtros con rango por defecto y ejecutar `GET /api/consumos?producto=...&desde=...&hasta=...`. Manejar errores de validación mostrando mensajes devueltos por el backend (`desde debe ser una fecha válida`, etc.).【F:src/modules/consumo/controllers/consumo.controller.ts†L25-L34】
2. **Creación**:
   - Abrir formulario vacío, validar campos y mostrar resumen previo.
   - Enviar `POST /api/consumos` con payload completo.
   - Al éxito, cerrar modal, refrescar listado y mostrar toast con `Consumo creado correctamente` (mensaje sugerido; backend devuelve objeto creado).
3. **Edición**:
   - Cargar datos existentes en el panel.
   - Enviar `PUT /api/consumos/{id}` con los campos modificados y cabecera `x-user`.
   - Manejar respuesta de error 400/404 mostrando alertas.
4. **Eliminación**:
   - Confirmar acción, solicitar motivo opcional y enviar `DELETE /api/consumos/{id}` con `x-user`.
   - Mostrar mensaje de éxito retornado por la API (`Consumo eliminado correctamente`).

## Integración con API REST
| Método | Endpoint | Parámetros/Payload | Respuesta | Errores a controlar |
| --- | --- | --- | --- | --- |
| POST | `/api/consumos` | `{ producto, insumo, cantidad, unidad, tipoProd?, fecha, calculationDate?, accessId? }` | 201 con consumo creado | 400 por validaciones (fechas, números) |
| GET | `/api/consumos` | Query `producto`, `desde`, `hasta` | Lista filtrada | 400 si fechas inválidas o rango incorrecto |
| PUT | `/api/consumos/{id}` | Payload parcial (al menos un campo modificable) + header `x-user` | Consumo actualizado | 400 si no hay campos, 404 si id inválido |
| DELETE | `/api/consumos/{id}` | Header `x-user` | `{ message: 'Consumo eliminado correctamente' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/consumos
Content-Type: application/json
x-user: fmartinez

{
  "producto": "Manteca gourmet",
  "insumo": "Leche descremada",
  "cantidad": 1250.5,
  "unidad": "kg",
  "tipoProd": "Lácteo",
  "fecha": "2024-05-15",
  "calculationDate": "2024-05-31",
  "accessId": "CONSUMO-2024-05-15-001"
}
```
```json
{
  "_id": "665ad311b5fb32d21b4f075a",
  "producto": "Manteca gourmet",
  "insumo": "Leche descremada",
  "cantidad": 1250.5,
  "unidad": "kg",
  "tipoProd": "Lácteo",
  "fecha": "2024-05-15T00:00:00.000Z",
  "calculationDate": "2024-05-31T00:00:00.000Z",
  "accessId": "CONSUMO-2024-05-15-001",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Destacar filas importadas (`accessId` presente) con un badge “Importado”.
- Permitir duplicar registro como base para nueva carga.
- Añadir botón “Exportar filtro” que descargue los resultados actuales.
