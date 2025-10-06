# Módulo Fecha de Cálculo

## Propósito
Definir y consultar la fecha de cálculo vigente utilizada como contexto en múltiples módulos (existencias, costos, consolidaciones). Permite fijar manualmente la fecha, registrar quién la modificó y, opcionalmente, importar la última fecha desde Access.【F:src/modules/fecha-calculo/controllers/calculation-date.controller.ts†L8-L18】【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L13-L76】【F:src/modules/fecha-calculo/model.ts†L4-L41】

## Diseño de interfaz
1. **Widget persistente** en la barra superior mostrando la fecha activa y el usuario que la configuró.
2. **Modal de actualización** accesible desde el widget con formularios para cambiar la fecha.
3. **Historial opcional** (tabla) que muestre registros anteriores si el backend expone endpoint; en caso contrario, mostrar solo último cambio.
4. **Acción de importación** (si se habilita) que permita seleccionar archivo `.mdb` y ejecutar importación.

## Formulario de actualización
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `date` | Selector de fecha (YYYY-MM-DD) | Requerido, fecha válida | El backend devuelve 400 si está vacío o inválido (`La fecha es requerida`, `Fecha inválida`).【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L20-L37】 |
| `createdBy` | Input de texto | Requerido, longitud 3-80 | Representa el usuario que realiza el cambio |
| `accessId` | Texto | Opcional | Para registros importados, validar unicidad si se captura |

### Reglas UX
- Deshabilitar “Guardar” hasta que la fecha y el usuario sean válidos.
- Mostrar confirmación indicando que cambiar la fecha afectará cálculos y consolidaciones.
- Tras guardar, actualizar inmediatamente el contexto global (estado de la aplicación).

## Flujo operativo
1. **Consulta inicial**: al iniciar la aplicación llamar `GET /api/fecha-calculo` y almacenar el valor ISO (`YYYY-MM-DD`). Si no existe registro, el backend retorna la fecha por defecto (`DEFAULT_CALCULATION_DATE` o fecha actual).【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L38-L61】
2. **Actualización**:
   - Abrir modal, prellenar `createdBy` con el usuario autenticado.
   - Enviar `POST /api/fecha-calculo` con `{ date, createdBy, accessId? }`.
   - Mostrar toast de éxito y propagar nueva fecha al resto del frontend (contexto global, caché de queries, etc.).
3. **Importar desde Access (opcional)**:
   - Habilitar botón “Importar” que permita seleccionar archivo `.mdb`.
   - Enviar archivo a endpoint dedicado (coordinado con backend) para ejecutar `importFromAccess`. El servicio valida existencia del archivo y carga la última fila de la tabla `CALCULO_FECHA`.【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L45-L74】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| GET | `/api/fecha-calculo` | — | `{ date: 'YYYY-MM-DD' }` | 500 si ocurre error interno |
| POST | `/api/fecha-calculo` | `{ date: 'YYYY-MM-DD', createdBy: string, accessId?: string }` | 201 con registro creado | 400 si la fecha es inválida |

### Ejemplo de request/respuesta
```http
POST /api/fecha-calculo
Content-Type: application/json

{
  "date": "2024-05-31",
  "createdBy": "lquiroga"
}
```
```json
{
  "_id": "665ad637b5fb32d21b4f0b02",
  "date": "2024-05-31T00:00:00.000Z",
  "createdBy": "lquiroga",
  "createdAt": "2024-05-25T15:20:31.000Z",
  "updatedAt": "2024-05-25T15:20:31.000Z",
  "__v": 0
}
```

### Experiencia de usuario recomendada
- Mostrar leyenda indicando la última modificación (`Actualizado por {createdBy} el {createdAt}`) usando los datos devueltos.
- Implementar notificación global para alertar a otros usuarios conectados cuando la fecha cambie (por ejemplo, usando websockets o polling).
- Validar que la fecha seleccionada no sea futura si el negocio lo requiere; mostrar advertencia antes de permitir guardar.
