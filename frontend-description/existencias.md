# Módulo Existencias

## Propósito
Resumir y consolidar las existencias por producto combinando la información de producción, ventas, pérdidas y sobrantes. Permite registrar existencias iniciales por período y generar asientos de control con balance de débitos y créditos para conciliación contable.【F:src/modules/existencias/services/existencias.service.ts†L1-L120】

## Diseño de interfaz
1. **Resumen principal**: tabla con columnas `producto`, `cantidadInicial`, `produccion`, `ventas`, `perdidas`, `sobrantes`, `cantidadFinal`. Mostrar totales en el pie.
2. **Tarjeta de balance**: componente destacado con los valores `debitos` y `creditos` devueltos por la API y alerta si no coinciden.
3. **Formulario de carga inicial**: sección que acepta múltiples filas (`producto`, `cantidad`, `accessId` opcional) con validaciones inline.
4. **Acción “Consolidar período”**: botón prominente con confirmación que dispara el proceso de consolidación.
5. **Historial de asientos** (opcional) mostrando consolidaciones previas y fecha de ejecución.

## Formulario de existencias iniciales
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `producto` | Autocompletar | Requerido | Validar capacidad mediante consulta previa; backend también valida.【F:src/modules/existencias/services/existencias.service.ts†L22-L40】 |
| `cantidad` | Input numérico decimal | Requerido, >=0 | Mostrar unidad (kg) |
| `accessId` | Texto | Opcional | Evita duplicados usando `ensureUniqueAccessId` |

### Reglas UX
- Permitir cargar varias filas antes de enviar; mostrar suma total.
- Deshabilitar botón “Guardar” si alguna fila tiene errores.
- Mostrar resultados de validación del backend (por ejemplo, capacidad excedida) con mensajes específicos.

## Flujo funcional
1. **Consulta inicial**: ejecutar `GET /api/existencias` para obtener resumen y asientos. Mostrar loader y mensaje “Sin datos” si el arreglo está vacío.【F:src/modules/existencias/controllers/existencias.controller.ts†L8-L12】
2. **Registro de iniciales**:
   - Recolectar las filas ingresadas y enviar `POST /api/existencias` (endpoint definido en rutas) con `{ existencias: [...] }` o arreglo simple según implementación.
   - El backend utiliza la fecha de cálculo del contexto o la fecha actual para registrar el movimiento.【F:src/modules/existencias/services/existencias.service.ts†L22-L40】
   - Tras éxito (201/204), refrescar el resumen y mostrar notificación.
3. **Consolidación**:
   - Al confirmar, llamar `POST /api/existencias/consolidar` con `{ fecha: calculationDate }` si la UI gestiona períodos.
   - La respuesta 204 indica éxito; mostrar mensaje y recargar `GET /api/existencias`.
   - Informar al usuario que se generó un backup automático.【F:src/modules/existencias/services/existencias.service.ts†L82-L119】

## Integración con API REST
| Método | Endpoint | Payload/Query | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/existencias` | — | `{ existencias: [...], asientos: { debitos, creditos } }` | Usar para poblar tabla y tarjeta de balance |
| POST | `/api/existencias` | Arreglo de `{ producto, cantidad, accessId? }` | 201/204 sin cuerpo | Validar datos antes de enviar |
| POST | `/api/existencias/consolidar` | `{ fecha?: 'YYYY-MM-DD' }` | 204 sin cuerpo | Tras ejecutar, refrescar resumen |

### Ejemplo de request/respuesta (registro inicial)
```http
POST /api/existencias
Content-Type: application/json
x-user: rrodriguez

[
  { "producto": "Queso semiduro", "cantidad": 850.5, "accessId": "EXI-2024-05-01" },
  { "producto": "Manteca gourmet", "cantidad": 420.0 }
]
```
```http
HTTP/1.1 201 Created
```

### Integración con asientos de control
- Tras consolidar (`POST /api/existencias/consolidar`), consultar inmediatamente `GET /api/asientos-control` y resaltar el asiento generado en la fecha seleccionada.
- Permitir crear ajustes manuales desde esta pantalla redirigiendo al módulo [Asientos de control](./asientos-control.md) con los campos precargados.

### Experiencia de usuario recomendada
- Mostrar diferencia `debitos - creditos`; si no es cero, resaltar en rojo e indicar revisar movimientos.
- Permitir exportar el resumen actual a Excel para auditorías.
- Guardar historial de consolidaciones con usuario y fecha para trazabilidad.
