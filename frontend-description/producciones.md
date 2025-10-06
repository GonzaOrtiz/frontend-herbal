# Módulo Producciones

## Propósito
Registrar producciones generales por producto, centro y etapa. Incluye validaciones estrictas sobre números y fechas mediante esquemas Zod y se utiliza como insumo para existencias y costos.【F:src/modules/produccion/controllers/produccion.controller.ts†L1-L43】【F:src/modules/produccion/dto/produccion.dto.ts†L1-L82】

## Diseño de interfaz
1. **Filtros superiores**: campos `producto`, `centro`, `etapa`, rango de fechas (`desde`, `hasta`) y botón “Aplicar”.
2. **Tabla principal** con columnas `producto`, `cantidad`, `centro`, `etapa`, `fecha`, `calculationDate`, `accessId`, acciones.
3. **Tarjeta de totales** mostrando suma de `cantidad` filtrada y variación vs. período anterior (si está disponible en la UI).
4. **Formulario de alta/edición** con validaciones en vivo y vista previa de impacto (ej. total por centro y porcentaje del total del período).

## Formularios y validaciones
| Campo | Control | Validaciones UI | Comentarios |
| --- | --- | --- | --- |
| `producto` | Autocompletar / texto | Requerido, trim automático | Backend exige no vacío.【F:src/modules/produccion/dto/produccion.dto.ts†L23-L39】 |
| `cantidad` | Input numérico | Requerido, >=0 | Permitir decimales si aplica |
| `centro` | Input numérico | Requerido, entero >=0 | Sugerir autocompletar desde centros |
| `etapa` | Dropdown / texto | Requerido | Definir catálogo de etapas |
| `fecha` | Selector de fecha | Requerido, formato válido | Backend transforma a ISO |
| `calculationDate` | Selector de fecha | Opcional, usar fecha de cálculo activa si se omite | |
| `accessId` | Texto | Opcional | Para trazabilidad con Access |

- `PUT` requiere al menos un campo distinto de `accessId`; de lo contrario, el backend responde 400 (`Debe proporcionar al menos un campo modificable`).【F:src/modules/produccion/dto/produccion.dto.ts†L56-L80】
- El `accessId` no puede modificarse en ediciones; si cambia, el servicio arroja error 400 (`accessId no puede modificarse`). Bloquee ese campo en la UI.【F:src/modules/produccion/services/produccion.service.ts†L70-L108】
- Validar en UI que `fecha` no sea anterior a un mínimo permitido si el negocio lo define.

## Flujo funcional
1. **Consulta inicial**: ejecutar `GET /api/producciones` con filtros por defecto (por ejemplo, mes actual). Manejar errores de validación de rango: el backend devuelve `hasta debe ser posterior o igual a desde` cuando el rango es inválido.【F:src/modules/produccion/dto/produccion.dto.ts†L30-L54】 El servicio aplica cache interno por combinación de filtros, por lo que conviene invalidarlo tras operaciones de escritura.
2. **Crear**:
   - Completar formulario y enviar `POST /api/producciones`.
   - Mostrar toast con registro creado y refrescar tabla.【F:src/modules/produccion/controllers/produccion.controller.ts†L13-L21】
3. **Editar**:
   - La API no expone `GET /api/producciones/{id}`; reutilice los datos de la fila seleccionada para precargar el formulario o implemente un estado local en el store.
   - Enviar `PUT /api/producciones/{id}` con campos modificados; manejar respuesta 400 cuando el payload esté vacío y 404 cuando el `id` no exista.【F:src/modules/produccion/controllers/produccion.controller.ts†L33-L37】【F:src/modules/produccion/services/produccion.service.ts†L87-L127】
4. **Eliminar**:
   - Confirmar y ejecutar `DELETE /api/producciones/{id}`. El servicio responde `{ message: 'Producción eliminada con éxito' }`; utilícelo para mostrar la notificación al usuario.【F:src/modules/produccion/controllers/produccion.controller.ts†L38-L43】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| POST | `/api/producciones` | `{ producto, cantidad, centro, etapa, fecha, calculationDate?, accessId? }` | 201 con registro creado | 400 si faltan campos o son inválidos |
| GET | `/api/producciones` | Query `producto`, `desde`, `hasta` | Lista de producciones | 400 si rango inválido |
| PUT | `/api/producciones/{id}` | Campos modificables | Registro actualizado | 400 si payload vacío, 404 si id inválido |
| DELETE | `/api/producciones/{id}` | — | `{ message: 'Producción eliminada con éxito' }` | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/producciones
Content-Type: application/json
x-user: asandoval

{
  "producto": "Queso semiduro",
  "cantidad": 980.5,
  "centro": 201,
  "etapa": "Maduración",
  "fecha": "2024-05-18",
  "calculationDate": "2024-05-31",
  "accessId": "PROD-2024-05-18-001"
}
```
```json
{
  "_id": "665ad920b5fb32d21b4f0df1",
  "producto": "Queso semiduro",
  "cantidad": 980.5,
  "centro": 201,
  "etapa": "Maduración",
  "fecha": "2024-05-18T00:00:00.000Z",
  "calculationDate": "2024-05-31T00:00:00.000Z",
  "accessId": "PROD-2024-05-18-001",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Agregar gráficos por centro y etapa para analizar cargas productivas.
- Permitir duplicar una producción para agilizar registros repetitivos.
- Mostrar alertas cuando `cantidad` sea 0 para validar si corresponde a un registro nulo.
