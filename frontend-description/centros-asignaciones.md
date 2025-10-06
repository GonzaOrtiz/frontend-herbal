# Módulo Centros - Asignaciones Manuales y Costos Finales

## Propósito
Permite registrar transferencias manuales de costos entre centros de producción y consultar el costo final consolidado por producto. Utiliza los prorrateos existentes para respetar porcentajes configurados y genera auditoría de cada operación manual.【F:src/modules/centros-asignaciones/controllers/centros-asignaciones.controller.ts†L1-L63】【F:src/modules/centros-asignaciones/services/centros-asignaciones.service.ts†L1-L65】

## Diseño de interfaz recomendado
1. **Tab “Asignaciones manuales”**: formulario maestro-detalle para registrar una transferencia puntual. Mostrar historial reciente con fecha, centro y monto aplicado.
2. **Tab “Costos finales”**: buscador por centro o producto con tarjetas que resuman el costo final calculado y botón para exportar resultados.
3. **Panel de auditoría**: listado lateral con últimas acciones mostrando usuario (`x-user`), fecha y monto transferido.
4. **Indicadores visuales**: badges para operaciones recientes y alertas cuando el monto transferido exceda la base calculada para el período.

## Formularios y validaciones

| Campo | Control | Validaciones UI | Comentarios |
| --- | --- | --- | --- |
| `centro` | Autocompletar desde catálogo de centros | Requerido | El backend registra auditoría con el identificador enviado.【F:src/modules/centros-asignaciones/controllers/centros-asignaciones.controller.ts†L37-L63】 |
| `monto` | Input numérico | Requerido, > 0, dos decimales | Comparar contra totales visibles para prevenir montos desproporcionados. |
| `fecha` | Selector de fecha (mes/año) | Requerido, formatear a ISO | Se utiliza para calcular la base de litros del período.【F:src/modules/centros-asignaciones/services/centros-asignaciones.service.ts†L33-L65】 |
| `observaciones` (UI) | Texto multilínea | Opcional | Guardar localmente; si se desea persistir, extender backend. |

### Reglas UX
- Autocompletar `centro` con nombre y `nroCentro` para reducir errores.
- Mostrar tooltip con la base en litros calculada para el centro seleccionado antes de confirmar.
- Solicitar confirmación con resumen (`centro`, `fecha`, `monto`) antes de enviar.
- Deshabilitar botón “Registrar” mientras la solicitud esté pendiente para evitar duplicados.

## Consultas de costos finales
- Proveer buscador por `centro` (string) y `producto` (numérico) con resultados en tarjetas o tabla.
- Mostrar detalle de cálculos (`base`, `porcentaje`, `aporte`) cuando el usuario expanda un registro.
- Permitir exportar los resultados a CSV con columnas `producto`, `costoFinal`, `centro`.

## Flujos de usuario
1. **Registrar transferencia manual**
   - Completar formulario y ejecutar `POST /api/asignaciones-manuales` enviando `centro`, `monto`, `fecha`.
   - Mostrar loader; al recibir 201 renderizar los pasos de prorrateo devueltos y refrescar el historial.
   - Mostrar toast con mensaje de auditoría (construido en frontend a partir de la respuesta).
2. **Consultar costo final por centro**
   - Ingresar `centro` y llamar `GET /api/asignaciones-finales?centro=ID`. Mostrar tarjeta con `{ centro, costoFinal }`.
   - Manejar error 400 cuando el query param esté ausente.
3. **Consultar costo final por producto** (opcional según UI)
   - Exponer acción adicional que consuma `GET /api/costos-finales/{producto}` y mostrar detalle en modal o tarjeta.【F:src/modules/centros-asignaciones/services/costos-finales.service.ts†L1-L36】【F:src/modules/centros/routes/costos-finales.routes.ts†L6-L8】

## Integración con API REST

| Método | Endpoint | Payload/Query | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/asignaciones-manuales` | `{ centro: string, monto: number, fecha: 'YYYY-MM-DD' }` | `[{ paso, montoAplicado, centroDestino, porcentaje }]` | Requiere cabecera `x-user` para auditoría (añadir desde frontend). |
| GET | `/api/asignaciones-finales` | Query `centro=string` | `{ centro: string, costoFinal: number }` | Error 400 si `centro` no se envía. |
| GET | `/api/costos-finales/{producto}` | — | `{ producto: number, costoFinal: number }` | Usar para mostrar detalle por SKU. |

### Ejemplo de request/respuesta
```http
POST /api/asignaciones-manuales
Content-Type: application/json
x-user: jdiaz

{
  "centro": "64fdc81c2f5a6b8d1a9a1c20",
  "monto": 12500.75,
  "fecha": "2024-05-01"
}
```
```json
[
  {
    "centroDestino": 301,
    "porcentaje": 60,
    "montoAplicado": 7500.45,
    "paso": "Centro 101 → Producto 301"
  },
  {
    "centroDestino": 302,
    "porcentaje": 40,
    "montoAplicado": 5000.3,
    "paso": "Centro 101 → Producto 302"
  }
]
```

## Experiencia de usuario recomendada
- Mostrar gráfico de barras con distribución del monto aplicado a cada centro destino.
- Permitir duplicar una transferencia previa como plantilla para el siguiente período.
- Registrar comentarios o etiquetas locales para facilitar conciliaciones posteriores.
- Integrar accesos directos a Reportes y Existencias con filtros precargados según el centro o producto consultado.
