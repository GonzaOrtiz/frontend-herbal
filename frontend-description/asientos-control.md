# Módulo Asientos de Control

## Propósito
Registrar y consultar los asientos de control que resumen los débitos y créditos generados tras la consolidación de existencias. Estos asientos utilizan la fecha de cálculo activa y permiten garantizar que el balance cuadre antes de cerrar el período.【F:src/modules/existencias/controllers/asiento-control.controller.ts†L1-L20】【F:src/modules/existencias/services/asiento-control.service.ts†L1-L22】

## Diseño de pantalla recomendado
1. **Resumen principal**: tarjetas con totales de `debitos`, `creditos` y `diferencia`. Incluir indicador visual (verde/amarillo/rojo) según la diferencia sea 0, menor a un umbral o superior.
2. **Tabla de asientos**: columnas `fecha`, `debitos`, `creditos`, `accessId` (cuando exista) y acciones. Permitir ordenar por fecha descendente.
3. **Formulario de creación**: modal simple con campos numéricos y selector de fecha (por defecto la fecha de cálculo actual).
4. **Panel lateral de auditoría**: mostrar quién creó el asiento utilizando la cabecera `x-user` enviada desde el frontend.

## Formularios y validaciones

| Campo | Control | Validaciones UI | Comentarios |
| --- | --- | --- | --- |
| `debitos` | Input numérico | Requerido, >= 0, dos decimales | Prellenar con el valor calculado desde Existencias. |
| `creditos` | Input numérico | Requerido, >= 0, dos decimales | Mostrar diferencia en tiempo real. |
| `fecha` | Selector de fecha | Requerido, inicializar con fecha de cálculo del contexto | El backend usa la fecha de cálculo si no se envía.【F:src/modules/existencias/controllers/asiento-control.controller.ts†L11-L18】 |
| `accessId` | Texto | Opcional, validar unicidad | Evita duplicados cuando se importan asientos desde Access.【F:src/modules/existencias/services/asiento-control.service.ts†L1-L22】 |

### Reglas UX
- Deshabilitar botón “Guardar” si `debitos` o `creditos` están vacíos.
- Mostrar advertencia cuando la diferencia sea distinta de cero e invitar a revisar los movimientos de existencias.
- Permitir duplicar un asiento cambiando solo la fecha (útil para ajustes manuales).

## Flujo de usuario
1. **Consulta**: ejecutar `GET /api/asientos-control` al abrir la vista. Mostrar loader y mensaje “Sin asientos registrados” cuando el arreglo esté vacío.
2. **Creación manual**:
   - Abrir modal con valores sugeridos (`debitos` y `creditos`) provenientes del módulo de Existencias.
   - Enviar `POST /api/asientos-control` con los campos validados y cabecera `x-user`.
   - Tras recibir 201, cerrar modal, refrescar listado y mostrar toast con resumen.
3. **Uso desde consolidación**: luego de consolidar existencias, navegar automáticamente a este módulo con el asiento recién generado resaltado.

## Integración con API REST

| Método | Endpoint | Payload/Query | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/asientos-control` | — | `[{ _id, debitos, creditos, fecha, accessId }]` | Ordenar en frontend por `fecha` descendente. |
| POST | `/api/asientos-control` | `{ debitos: number, creditos: number, fecha?: 'YYYY-MM-DD', accessId?: string }` | `{ _id, debitos, creditos, fecha, accessId }` | El servicio valida que `accessId` sea único. |

### Ejemplo de request/respuesta
```http
POST /api/asientos-control
Content-Type: application/json
x-user: mruiz

{
  "debitos": 25340.12,
  "creditos": 25340.12,
  "fecha": "2024-05-31",
  "accessId": "ASIENTO-2024-05"
}
```
```json
{
  "_id": "665ff54d98e7ad001279b103",
  "debitos": 25340.12,
  "creditos": 25340.12,
  "fecha": "2024-05-31T00:00:00.000Z",
  "accessId": "ASIENTO-2024-05"
}
```

## Experiencia de usuario recomendada
- Integrar botón “Ver movimientos” que abra el módulo de Existencias filtrado por la fecha del asiento.
- Permitir exportar asientos filtrados a CSV/Excel con totales acumulados.
- Mostrar badges para asientos importados (`accessId` presente) y manuales (sin `accessId`).
- Registrar observaciones locales para cada asiento y mostrar historial de modificaciones en la UI (a nivel frontend).
