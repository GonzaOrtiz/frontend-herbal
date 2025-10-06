# Módulo CIF (Costos Indirectos de Fabricación)

## Propósito
Centraliza la carga y consulta de costos indirectos totales y unitarios por producto y período. Los modelos almacenan montos, bases de reparto y cantidades calculadas para determinar el costo unitario y garantizan unicidad por combinación producto-período.【F:src/modules/cif/entities/cif-total.model.ts†L4-L35】【F:src/modules/cif/entities/cif-unitario.model.ts†L4-L35】

## Estructura de pantalla sugerida
1. **Panel de filtros globales** con selección de producto (autocompletar), rango de períodos y botón “Aplicar”.
2. **Tarjetas resumen** con métricas clave: último CIF total, costo unitario vigente y fecha del último recalculo.
3. **Sección de carga manual** dividida en dos formularios (Total y Unitario) ubicados en tabs o acordeones.
4. **Tabla de historial** con vistas alternables (totales vs. unitarios) que permita ordenar, paginar y exportar.
5. **Acciones destacadas**: botón “Recalcular desde costos” disponible en todo momento con confirmación.

## Formularios y validaciones
### CIF Total
| Campo | Control | Validaciones UI | Comentarios |
| --- | --- | --- | --- |
| `producto` | Autocompletar (catálogo de productos) | Requerido | Guardar id interno (string) y mostrar nombre comercial |
| `periodo` | Selector de mes/año (transformar a fecha ISO) | Requerido, no permitir fechas futuras | El backend convierte a `Date` | 
| `monto` | Input numérico decimal | Requerido, >0 | Mostrar formato monetario |
| `base` | Input numérico decimal | Requerido, >=0 | Representa base de prorrateo |
| `accessId` | Texto opcional | Opcional, validar unicidad si se captura | El servicio rechaza duplicados mediante `ensureUniqueAccessId` |

### CIF Unitario
| Campo | Control | Validaciones UI | Comentarios |
| --- | --- | --- | --- |
| `producto` | Autocompletar | Requerido | Debe coincidir con registro de CIF total |
| `periodo` | Selector de mes/año | Requerido | Debe existir CIF total para este período, de lo contrario se muestra error |
| `cantidad` | Input numérico decimal | Requerido, >0 | Se usa para calcular costo unitario; el backend rechaza cantidades <= 0.【F:src/modules/cif/services/cif.service.ts†L40-L73】 |
| `accessId` | Texto opcional | Opcional | Permite trazar registros importados |

### Reglas adicionales
- Validar en frontend que no exista duplicado consultando `/api/cif/total/{producto}?periodo=...` antes de crear.
- Mostrar coste unitario calculado (`monto / cantidad`) antes de guardar para confirmación del usuario.
- Deshabilitar envío mientras se procesa la solicitud para evitar múltiples inserciones.

## Flujo funcional
1. **Consulta inicial**: tras elegir un producto y período, ejecutar en paralelo `GET /api/cif/total/{producto}?periodo=...` y `GET /api/cif/unitario/{producto}?periodo=...`. Renderizar tablas con resultados.【F:src/modules/cif/controllers/cif.controller.ts†L24-L43】
2. **Registro manual de CIF total**:
   - Validar campos en UI, mostrar resumen del payload.
   - Enviar `POST /api/cif/total` con `{ producto, periodo, monto, base, accessId? }`.
   - Ante conflicto (HTTP 409, mensaje `CIF_TOTAL_DUPLICATE`), resaltar selector de período y ofrecer opción de editar.
3. **Cálculo de CIF unitario**:
   - Solicitar `cantidad` y opcionalmente `accessId`.
   - Enviar `POST /api/cif/unitario`.
   - Manejar errores: 404 (`CIF_TOTAL_NOT_FOUND`) cuando falta registro total; 400 (`CANTIDAD_MAYOR_CERO`). Mostrar mensajes contextuales.【F:src/modules/cif/services/cif.service.ts†L20-L73】
4. **Recalculo automático**:
   - Botón que abra confirmación indicando que se recalculará con costos finales y producción consolidada.
   - Enviar `POST /api/cif/recalcular` con `{ periodo }`. La respuesta incluye montos y costo unitario calculado.【F:src/modules/cif/controllers/cif.controller.ts†L45-L50】【F:src/modules/cif/services/cif.service.ts†L87-L133】
5. **Historial**:
   - Permitir exportar a CSV y agrupar por período.
   - Mostrar badges para registros importados (`accessId` presente).

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores a contemplar |
| --- | --- | --- | --- | --- |
| POST | `/api/cif/total` | `{ producto: string, periodo: 'YYYY-MM-01', monto: number, base: number, accessId?: string }` | 201 con documento creado (`{ _id, producto, periodo, monto, base, accessId? }`) | 409 si ya existe el período, 400 si faltan campos |
| POST | `/api/cif/unitario` | `{ producto: string, periodo: 'YYYY-MM-01', cantidad: number, accessId?: string }` | 201 con `{ producto, periodo, costoUnitario, cantidad, accessId? }` | 404 si no hay CIF total, 400 si `cantidad <= 0` |
| GET | `/api/cif/total/{producto}` | Query opcional `periodo=YYYY-MM-01` | Arreglo de registros totales | — |
| GET | `/api/cif/unitario/{producto}` | Query opcional `periodo=YYYY-MM-01` | Arreglo de registros unitarios | — |
| POST | `/api/cif/recalcular` | `{ periodo: 'YYYY-MM-01' }` | `{ producto, periodo, monto, base, costoUnitario }` | Validar errores de negocio provenientes del servicio |

### Ejemplo de request/respuesta (CIF total)
```http
POST /api/cif/total
Content-Type: application/json
x-user: lquiroga

{
  "producto": "64fe0123d4b8a1c2e5f901ab",
  "periodo": "2024-05-01",
  "monto": 185000.75,
  "base": 12450.5,
  "accessId": "CIF-TOTAL-2024-05"
}
```
```json
{
  "_id": "665ad1d3b5fb32d21b4f0542",
  "producto": "64fe0123d4b8a1c2e5f901ab",
  "periodo": "2024-05-01T00:00:00.000Z",
  "monto": 185000.75,
  "base": 12450.5,
  "accessId": "CIF-TOTAL-2024-05",
  "__v": 0
}
```

### Recomendaciones UX
- Mostrar advertencia cuando la base sea 0 pero exista monto (genera costo unitario infinito) y sugerir verificar la producción.
- Guardar bitácora visual (chips) indicando origen del registro: manual, importado (`accessId`) o recalculado.
- Implementar versionado de registros permitiendo comparar períodos consecutivos en gráficos.
