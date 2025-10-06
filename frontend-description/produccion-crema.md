# Módulo Producción de Crema

## Propósito
Registrar la producción de crema pura a partir de lotes importados o cargados manualmente, con información de fecha (`FechaCre`), producto (`ProdCre`) y consumo (`ConsuCre`). Los registros pueden provenir de Access utilizando `accessId` para garantizar idempotencia.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L1-L47】【F:src/modules/prodcrema/entities/prodcrema.model.ts†L4-L33】

## Diseño de interfaz
1. **Panel de reproceso/importación**: formulario que solicita `fecha` y permite previsualizar los datos que se importarán.
2. **Tabla principal** con columnas `FechaCre`, `ProdCre`, `ConsuCre`, `accessId`, `fechaImportacion` (si se añade) y acciones.
3. **Formulario de edición** en modal para ajustar registros individuales.
4. **Totales**: tarjeta que muestre suma de `ConsuCre` por filtro actual.

## Formularios y validaciones
### Procesar lote
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `fecha` | Selector de fecha | Requerido | El backend responde 400 si falta. |
| `datos` | Área de carga (JSON o tabla editable) | Requerido, debe ser arreglo | Validar que cada elemento tenga `ProdCre`, `ConsuCre`, `FechaCre` |

### Edición individual
| Campo | Control | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `FechaCre` | Selector de fecha | Requerido | Convertir a ISO antes de enviar |
| `ProdCre` | Texto | Opcional, validar longitud | |
| `ConsuCre` | Número decimal | Requerido, ≥0 | |
| `accessId` | Texto | Solo lectura | Mantener para evitar duplicados |

## Flujo funcional
1. **Procesar lote**:
   - Usuario selecciona fecha y prepara datos (por ejemplo, importados desde Access).
   - Enviar `POST /api/prodcrema` con `{ fecha, datos: [...] }`.
   - Mostrar mensaje `{ message: 'Producción de crema registrada' }` al éxito.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L10-L22】
2. **Listar**: ejecutar `GET /api/prodcrema` para poblar la tabla.
3. **Editar**: abrir modal, permitir cambios y enviar `PUT /api/prodcrema/{id}` con campos modificados. Manejar 404 (`Producción de crema no encontrada`).【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L24-L37】
4. **Eliminar**: confirmar y ejecutar `DELETE /api/prodcrema/{id}`. La API responde 204; mostrar notificación visual.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L39-L47】

## Integración con API REST
| Método | Endpoint | Payload | Respuesta | Errores |
| --- | --- | --- | --- | --- |
| POST | `/api/prodcrema` | `{ fecha: 'YYYY-MM-DD', datos: [{ FechaCre, ProdCre, ConsuCre, accessId? }, ...] }` | 201 con mensaje | 400 si falta fecha o datos |
| GET | `/api/prodcrema` | — | Lista de registros | — |
| PUT | `/api/prodcrema/{id}` | Campos modificados | Registro actualizado | 404 si no existe |
| DELETE | `/api/prodcrema/{id}` | — | 204 sin cuerpo | 404 si no existe |

### Ejemplo de request/respuesta
```http
POST /api/prodcrema
Content-Type: application/json

{
  "fecha": "2024-05-01",
  "datos": [
    { "FechaCre": "2024-05-01", "ProdCre": "Lote 105", "ConsuCre": 420.5, "accessId": "PRODCRE-2024-05-01-001" }
  ]
}
```
```json
{
  "message": "Producción de crema registrada"
}
```

### Experiencia de usuario recomendada
- Permitir cargar archivos CSV para rellenar automáticamente el arreglo `datos` antes de enviar.
- Mostrar historial de importaciones por fecha y usuario.
- Habilitar filtros por producto y rango de fechas para análisis rápido.
