# Módulo Costos

## Propósito
Gestionar egresos asociados a los centros de producción: gastos operativos, depreciaciones de maquinaria y sueldos. El módulo también expone el resultado del prorrateo automático que se ejecuta tras importaciones o sincronizaciones y permite validar que los montos importados coincidan con los distribuidos. Los DTO aplican validaciones numéricas, fechas válidas y soporte de carga masiva (arreglos).【F:src/modules/costos/dto/costos.dto.ts†L1-L229】【F:src/modules/costos/controllers/costos.controller.ts†L1-L219】【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】

## Diseño funcional
1. **Tabs por submódulo**: Gastos, Depreciaciones, Sueldos y un panel informativo de prorrateo automático.
2. **Panel de filtros** en cada tab con campos específicos (`centro`, `fechaCalculo`, `esGastoDelPeriodo`, `nroEmpleado`).
3. **Tabla paginada** mostrando registros con totales en el pie y badges para `esGastoDelPeriodo`.
4. **Formulario dual**: pestaña “Carga individual” y “Carga masiva”. En carga masiva permitir pegar JSON o subir archivo convertido a objetos.
5. **Panel de resultados** después de cada operación mostrando `balance` y mensajes de advertencia (`warning`).

## Campos por submódulo
### Gastos por centro
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `centro` | Número entero | Requerido, ≥0 | Autocompletar centros |
| `fecha` | Fecha | Requerido | Fecha de gasto |
| `concepto` | Texto | Opcional | Descripción libre |
| `monto` | Número decimal | Requerido, ≥0 | Formato monetario |
| `tipo` | Texto | Opcional | Clasificación (energía, reparaciones, etc.) |
| `fechaCalculo` | Fecha | Requerido | Periodo contable |
| `esGastoDelPeriodo` | Booleano | Opcional | Switch |
| `tablaOrigen` | Texto | Opcional | Solo lectura para importados |
| `detalle` | JSON | Opcional | Mostrar en acordeón |
| `accessId` | Texto | Opcional | Identificador Access |

### Depreciaciones
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `centro` | Entero | Requerido | |
| `fechaCalculo` | Fecha | Requerido | |
| `maquina` | Texto | Requerido | Código de la maquinaria |
| `depreMensual` | Número decimal | Requerido, ≥0 | |
| `vidaUtil` | Número | Opcional, ≥0 | |
| `valorUso` | Número | Opcional, ≥0 | |
| `periodo` | Texto | Opcional | Periodo original |
| `esGastoDelPeriodo` | Booleano | Opcional | |
| `accessId` | Texto | Opcional | |

### Sueldos
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `centro` | Entero | Requerido | |
| `nroEmpleado` | Entero | Requerido, ≥0 | Autocompletar empleados |
| `fechaSueldo` | Fecha | Requerido | Fecha de pago |
| `sueldoTotal` | Número decimal | Requerido, ≥0 | |
| `fechaCalculo` | Fecha | Requerido | Periodo contable |
| `esGastoDelPeriodo` | Booleano | Opcional | |
| `accessId` | Texto | Opcional | |

### Panel de prorrateo automático
- Mostrar la fecha y parámetros utilizados por el proceso backend `CostosSyncService` y el resultado del último prorrateo disponible.
- Incluir indicadores del balance (`diferencia`, `warning`) calculados después de registrar sueldos, depreciaciones o gastos.
- No existen inputs en la UI porque actualmente no hay endpoint público para ejecutar manualmente el prorrateo; el cálculo se dispara desde importaciones y sincronizaciones programadas.【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】

## Reglas de validación y UX
- Las operaciones POST aceptan un objeto o un arreglo; si se envía arreglo vacío el backend responde error (`Debe proporcionar al menos un registro`).【F:src/modules/costos/dto/costos.dto.ts†L45-L121】
- PUT requiere al menos un campo modificable; de lo contrario retorna 400 (`Debe proporcionar al menos un campo para actualizar`).
- Todas las operaciones PUT/DELETE deben incluir cabecera `x-user` para auditoría.【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】
- Tras cada operación, la API devuelve `balance` y opcionalmente `warning` si la `diferencia` es distinta de cero; mostrarlo en banner informativo.【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】
- El prorrateo se ejecuta automáticamente al finalizar importaciones o sincronizaciones; registrar la fecha y responsable visibles en el panel informativo.【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】

## Flujo por submódulo
1. **Consultar**: ejecutar el `GET` correspondiente con filtros seleccionados. Mostrar spinner y mensajes de estado vacío.
2. **Registrar**:
   - Validar campos según tablas anteriores.
   - Enviar `POST` (objeto o arreglo). Mostrar totales enviados antes de confirmar.
   - Al recibir respuesta, refrescar tabla y mostrar `balance` y `warning`.
3. **Actualizar**:
   - Abrir panel con datos existentes.
   - Enviar `PUT /api/costos/{tipo}/{id}` con campos modificados y `x-user`.
   - Manejar 404 (`Gasto/Depreciación/Sueldo no encontrado`) mostrando alerta y refrescando.
4. **Eliminar**:
   - Solicitar confirmación, enviar `DELETE` con `x-user`.
   - Mostrar mensaje de éxito y `balance` actualizado.
5. **Prorrateo**:
   - Mostrar el resumen generado por los procesos automáticos (importaciones o sincronizaciones programadas) y refrescarlo cuando cambien los costos base.
   - Permitir recargar manualmente el panel consultando nuevamente los endpoints de gastos/depreciaciones/sueldos para recalcular balances en el frontend.

## Endpoints
| Submódulo | Método | Endpoint | Payload/Query | Respuesta | Observaciones |
| --- | --- | --- | --- | --- | --- |
| Gastos | GET | `/api/costos/gasto-centro` | Query `centro`, `fechaCalculo`, `esGastoDelPeriodo` | Lista de gastos | |
|  | POST | `/api/costos/gasto-centro` | Objeto o arreglo de gastos | `{ ...resultados, balance, warning? }` | Mostrar `warning` si `diferencia !== 0` |
|  | PUT | `/api/costos/gasto-centro/{id}` | Payload parcial + header `x-user` | `{ actualizado, balance, warning? }` | 404 si no existe |
|  | DELETE | `/api/costos/gasto-centro/{id}` | Header `x-user` | `{ message, balance, warning? }` | |
| Depreciaciones | GET | `/api/costos/depreciacion` | Query similares | Lista | |
|  | POST | `/api/costos/depreciacion` | Objeto o arreglo | `{ ...resultados, balance, warning? }` | |
|  | PUT | `/api/costos/depreciacion/{id}` | Payload parcial + `x-user` | `{ actualizado, balance, warning? }` | |
|  | DELETE | `/api/costos/depreciacion/{id}` | `x-user` | `{ message, balance, warning? }` | |
| Sueldos | GET | `/api/costos/sueldo` | Query `centro`, `fechaCalculo`, `nroEmpleado`, `esGastoDelPeriodo` | Lista | |
|  | POST | `/api/costos/sueldo` | Objeto o arreglo | `{ ...resultados, balance, warning? }` | |
|  | PUT | `/api/costos/sueldo/{id}` | Payload parcial + `x-user` | `{ actualizado, balance, warning? }` | |
|  | DELETE | `/api/costos/sueldo/{id}` | `x-user` | `{ message, balance, warning? }` | |
| Prorrateo | — | — | — | El prorrateo se ejecuta en backend (`CostosSyncService`); la UI solo presenta resultados y balances. | Mostrar fecha y parámetros del último cálculo |

### Ejemplo de request/respuesta (gasto por centro)
```http
POST /api/costos/gasto-centro
Content-Type: application/json
x-user: gsalinas

{
  "centro": 101,
  "fecha": "2024-05-10",
  "concepto": "Reparación de caldera",
  "monto": 8420.75,
  "tipo": "Mantenimiento",
  "fechaCalculo": "2024-05-31",
  "esGastoDelPeriodo": true,
  "accessId": "GASTO-2024-05-10-001"
}
```
```json
{
  "created": 1,
  "balance": 0,
  "warning": null
}
```

### Experiencia de usuario recomendada
- Mostrar indicadores visuales cuando `warning` esté presente para alertar de desbalances.
- Permitir exportar resultados filtrados y balances.
- Guardar configuraciones favoritas de filtros por usuario.
