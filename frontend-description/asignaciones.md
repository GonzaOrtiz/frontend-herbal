# Módulo Asignaciones base

## Propósito y relación de negocio
Administra la red de prorrateos automáticos entre centros de apoyo y centros de producción. Cada registro guarda el centro origen, el centro destino, el porcentaje que se prorratea y la fecha de vigencia, además de campos importados desde Access (`accessId`, `base`, `monto`, `tasa`) utilizados en conciliaciones posteriores.【F:src/modules/asignacion/entities/asignacion.model.ts†L5-L41】

Estas asignaciones se importan al comienzo del período y sirven como insumo para el historial de prorrateos, el cálculo de costos finales por centro y los ajustes manuales registrados después.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L15-L72】【F:src/modules/centros-asignaciones/controllers/centros-asignaciones.controller.ts†L31-L63】 Por ello, la UI debe permitir revisar, complementar o corregir los porcentajes antes de ejecutar procesos de distribución o cierres contables.

## Diseño funcional sugerido
1. **Listado maestro** filtrable por centro origen, centro destino, fecha y estado (vigente/vencido). Cada fila debe mostrar porcentaje acumulado del centro origen para prevenir excedentes.
2. **Panel de detalle/edición** (drawer o modal) con formulario para crear o actualizar el prorrateo. Incluir un indicador que calcule el porcentaje acumulado actual antes de guardar.
3. **Pestaña de historial** integrada que consuma `/api/asignaciones/historial/:centro` y muestre la secuencia de pasos generados por los procesos automáticos; enlazar con el módulo dedicado para análisis profundo.【F:src/modules/asignacion/routes/asignacion.routes.ts†L17-L18】
4. **Panel de métricas** con tarjetas que consulten `/api/asignaciones/costo-final/:centro` para resumir el impacto económico del prorrateo seleccionado.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L64-L72】
5. **Integración con catálogos**: usar autocompletados de centros de apoyo y de producción para minimizar errores de selección.

## Formularios y validaciones de UI
| Campo | Control sugerido | Validaciones en frontend | Referencia backend |
| --- | --- | --- | --- |
| `desde` (centro origen) | Autocompletar obligatorio | Requerido, no puede ser igual a `hacia` | El middleware rechaza ausencia, duplicidad o centros inexistentes.【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L22-L39】 |
| `hacia` (centro destino) | Autocompletar obligatorio | Requerido, distinto de `desde` | Mismas validaciones que `desde`.【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L22-L39】 |
| `porcentaje` | Input numérico con máscara de 2 decimales | Requerido, 0 ≤ valor ≤ 100, validar suma acumulada antes de enviar | El middleware y los servicios impiden exceder 100 % considerando registros previos.【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L41-L58】【F:src/modules/asignacion/services/prorrateo.service.ts†L9-L36】 |
| `fecha` | Selector `YYYY-MM-DD` | Requerida, no futura | Backend valida formato y prohíbe fechas futuras.【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L61-L76】 |

## Flujo recomendado
1. **Importar/validar asignaciones iniciales**
   - Al abrir la vista, ejecutar `GET /api/asignaciones` y agrupar resultados por centro origen para mostrar el porcentaje acumulado existente.【F:src/modules/asignacion/routes/asignacion.routes.ts†L15-L21】
   - Marcar visualmente los centros con acumulado <100 % (requiere completar) o >100 % (error) para que el usuario priorice su revisión.
2. **Crear un prorrateo**
   - Solicitar centros desde catálogos, indicar el porcentaje restante disponible y la fecha de vigencia.
   - Enviar `POST /api/asignaciones` al confirmar. Manejar respuestas 400 cuando la suma supera 100 % o la fecha es inválida mostrando mensajes devueltos por la API.【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L41-L76】
   - Registrar notificación de éxito incluyendo el porcentaje acumulado actualizado (puede obtenerse recalculándolo en el cliente).
3. **Editar un prorrateo**
   - Cargar datos mediante `GET /api/asignaciones/:id` y bloquear `accessId` si se expone en UI para preservar trazabilidad.
   - Al guardar con `PUT /api/asignaciones/:id`, recalcular en UI el nuevo acumulado y refrescar el listado. El servicio vuelve a validar que centros existan y que el acumulado no exceda 100 % excluyendo el registro editado.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L40-L53】【F:src/modules/asignacion/services/asignacion.service.ts†L54-L93】
4. **Eliminar un prorrateo**
   - Solicitar confirmación textual indicando origen, destino y porcentaje.
   - Ejecutar `DELETE /api/asignaciones/:id` y mostrar mensaje `{ message: 'Asignación eliminada correctamente' }`. Registrar en UI quién realizó la acción para mantener auditoría coherente con el backend.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L55-L62】
5. **Analizar impacto**
   - Tras ajustar porcentajes, consultar `GET /api/asignaciones/historial/:centro` y `GET /api/asignaciones/costo-final/:centro` para validar cómo cambian los montos distribuidos. Mostrar advertencias cuando la suma de pasos no llegue a 100 % o cuando el costo final varíe respecto al período anterior.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L64-L72】

## Orden dentro del proceso mensual
1. **Revisión posterior a la importación**: luego de cargar Access, revisar los prorrateos importados antes de permitir ajustes manuales o ejecuciones de centros-asignaciones. Así se asegura que las bases automáticas estén equilibradas.【F:src/modules/importaciones/controllers/importaciones.controller.ts†L82-L150】【F:src/modules/asignacion/services/prorrateo.service.ts†L9-L36】
2. **Validar antes de centros-asignaciones**: confirmar que cada centro de apoyo llegue al 100 % en sus asignaciones base antes de registrar transferencias manuales (`/api/asignaciones-manuales`), evitando diferencias durante los cierres.【F:src/modules/asignacion/services/prorrateo.service.ts†L9-L36】【F:src/modules/centros-asignaciones/controllers/centros-asignaciones.controller.ts†L31-L63】
3. **Previo a reportes finales**: ejecutar nuevamente las consultas de historial y costo final para verificar que los reportes de costos y CIF reflejen porcentajes correctos.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L64-L72】【F:src/modules/reportes/services/reports.service.ts†L59-L104】

## Experiencia de usuario recomendada
- Mostrar barras de progreso por centro origen con colores (verde = 100 %, amarillo <100 %, rojo >100 %).
- Incluir filtros rápidos para detectar asignaciones sin fecha o con porcentajes atípicos.
- Guardar borradores locales cuando se editen varios prorrateos en cadena para evitar perder cambios si ocurre un error en un envío.
- Proveer exportación CSV/Excel con columnas `desde`, `hacia`, `porcentaje`, `fecha`, `base`, `monto` para facilitar conciliaciones con contabilidad.
