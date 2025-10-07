# Referencia rápida de API

Esta guía resume los endpoints REST disponibles en el backend para facilitar la integración del frontend. Para cada módulo se indican métodos soportados, parámetros relevantes y el formato esperado de las respuestas.

## Convenciones globales

- **Base URL**: todas las rutas están montadas bajo `/api`, excepto la carga de archivos Access que utiliza `/import`.【F:src/index.ts†L91-L115】【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
- **Autenticación**: los endpoints esperan token Bearer. Las operaciones sensibles registran al usuario mediante la cabecera `x-user` (Costos, Consumos, Importaciones).【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
- **Fecha de cálculo**: un middleware agrega la fecha activa a `req.context`. El frontend debe consultarla y mantenerla sincronizada en todas las vistas.【F:src/modules/fecha-calculo/middleware.ts†L9-L21】
- **Errores**: las respuestas de error siguen el formato `{ "message": string }`. Manejar validaciones HTTP 400 y estados 404 para registros inexistentes.【F:src/common/middlewares/error-handler.ts†L3-L16】

## Catálogos y configuración

### Actividades

| Método | Ruta | Request principal | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/actividades` | — | Lista de actividades (`_id`, `nroAct`, `nombre`). | Ordenar por `nroAct` en frontend.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】【F:src/modules/actividad/entities/actividad.model.ts†L5-L17】 |
| GET | `/api/actividades/:id` | Parámetro `id` (ObjectId). | Actividad por id. | 404 si no existe.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】 |
| POST | `/api/actividades` | `{ "nombre": string }` | Actividad creada con `nroAct`. | Backend genera correlativo.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】【F:src/modules/actividad/controllers/actividad.controller.ts†L21-L55】 |
| PUT | `/api/actividades/:id` | `{ "nombre": string }` | Actividad actualizada. | Validar duplicados en UI.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】 |
| DELETE | `/api/actividades/:id` | — | `{ message: 'Actividad eliminada con éxito' }` | Confirmar antes de eliminar.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】 |

### Empleados

| Método | Ruta | Request principal | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/empleados` | — | Lista con `Nroem`, `nombre`. | Mostrar `Nroem` autogenerado.【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】【F:src/modules/empleado/entities/empleado.model.ts†L5-L19】 |
| GET | `/api/empleados/:id` | Parámetro `id`. | Empleado específico. | 404 si no existe.【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】 |
| POST | `/api/empleados` | `{ "nombre": string }` | Empleado creado con `Nroem`. | Validar longitud mínima.【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】【F:src/modules/empleado/controllers/empleado.controller.ts†L23-L45】 |
| PUT | `/api/empleados/:id` | `{ "nombre": string }` | Empleado actualizado. | —【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】 |
| DELETE | `/api/empleados/:id` | — | `{ message: 'Empleado eliminado correctamente' }` | —【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】 |

### Centros de producción

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/centros-produccion` | — | Lista de centros (`nroCentro`, `nombre`). | —【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】【F:src/modules/centro-produccion/entities/centro-produccion.model.ts†L5-L20】 |
| GET | `/api/centros-produccion/:id` | Parámetro `id`. | Centro por id. | 404 si no existe.【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】 |
| POST | `/api/centros-produccion` | `{ "nroCentro": number, "nombre": string }` | Centro creado. | Validar entero positivo.【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】【F:src/modules/centro-produccion/controllers/centro-produccion.controller.ts†L24-L55】 |
| PUT | `/api/centros-produccion/:id` | `{ "nombre": string }` | Centro actualizado. | —【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】 |
| DELETE | `/api/centros-produccion/:id` | — | `{ message: 'Centro de producción eliminado con éxito' }` | —【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】 |

### Centros de apoyo

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/centros-apoyo` | — | Lista de centros de apoyo. | —【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L11-L14】 |
| GET | `/api/centros-apoyo/:id` | Parámetro `id`. | Centro por id. | 404 si no existe.【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L11-L14】 |
| PUT | `/api/centros-apoyo/:id` | `{ "nombre": string }` | Centro actualizado. | Cabecera `x-user` opcional para auditoría.【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L11-L14】 |
| GET | `/api/centros-apoyo/gastos` | Query `fechaCalculo?`, `esGastoDelPeriodo?`. | Arreglo de gastos por centro. | Usar para panel analítico.【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L11-L14】 |

### Catálogos (insumos, listas, maquinarias)

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/catalogos/insumos` | Query opcionales (`activo`, `usado`). | Lista de insumos. | —【F:src/modules/catalogos/controller.ts†L20-L30】 |
| POST | `/api/catalogos/insumos` | Objeto catálogo. | Item creado. | Validar campos requeridos.【F:src/modules/catalogos/controller.ts†L20-L30】 |
| PUT | `/api/catalogos/insumos/:id` | Campos a actualizar. | Item actualizado. | Enviar `x-user`.【F:src/modules/catalogos/controller.ts†L20-L30】 |
| DELETE | `/api/catalogos/insumos/:id` | — | `{ message }`. | Confirmar en UI.【F:src/modules/catalogos/controller.ts†L20-L30】 |
| POST | `/api/catalogos/insumos/sync` | Arreglo de insumos. | Resultado de sincronización. | Validar que el cuerpo sea arreglo.【F:src/modules/catalogos/controller.ts†L20-L30】 |
| ... | Rutas equivalentes para `/lista-precio` y `/maquinarias`. | — | — | Misma estructura, usar tablas correspondientes.【F:src/modules/catalogos/controller.ts†L32-L62】 |

### Fecha de cálculo

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/fecha-calculo` | — | `{ "date": 'YYYY-MM-DD' }` | Mostrar en header global.【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】 |
| POST | `/api/fecha-calculo` | `{ "date": 'YYYY-MM-DD', "createdBy": string, "accessId"? }` | Registro creado con `createdAt`. | Disparar refresco global.【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】 |

## Operación diaria

### Consumos

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/consumos` | `{ producto, insumo, cantidad, unidad, fecha, ... }` | Consumo creado. | Validación Zod en backend.【F:src/modules/consumo/routes/consumo.routes.ts†L16-L27】【F:src/modules/consumo/dto/consumo.dto.ts†L1-L88】 |
| GET | `/api/consumos` | Query `producto?`, `desde?`, `hasta?`. | Lista filtrada. | Manejar errores 400 por fechas inválidas.【F:src/modules/consumo/routes/consumo.routes.ts†L16-L27】 |
| PUT | `/api/consumos/:id` | Campos parciales. | Consumo actualizado. | Requiere `x-user`.【F:src/modules/consumo/routes/consumo.routes.ts†L18-L27】【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】 |
| DELETE | `/api/consumos/:id` | — | `{ message: 'Consumo eliminado correctamente' }` | Requiere `x-user`.【F:src/modules/consumo/routes/consumo.routes.ts†L23-L27】 |

### Producciones

Los registros de producción son la base para cálculos de existencias y costos. El backend valida los payloads con Zod e impide modificar `accessId` una vez creado.【F:src/modules/produccion/dto/produccion.dto.ts†L1-L96】【F:src/modules/produccion/services/produccion.service.ts†L61-L129】

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/producciones` | JSON con `producto` (string), `cantidad` (number ≥0), `centro` (number entero), `etapa` (string), `fecha` (`YYYY-MM-DD`), opcionales `calculationDate`, `accessId`. | Objeto creado `{ _id, producto, cantidad, centro, etapa, fecha, calculationDate, accessId }`. | Devuelve 400 cuando faltan campos o `fecha` no es válida.【F:src/modules/produccion/routes/produccion.routes.ts†L16-L27】【F:src/modules/produccion/controllers/produccion.controller.ts†L13-L21】 |
| GET | `/api/producciones` | Query opcionales `producto`, `desde`, `hasta`. | Arreglo ordenado por fecha descendente. | El servicio cachea resultados por combinación de filtros; invalide tras POST/PUT/DELETE.【F:src/modules/produccion/routes/produccion.routes.ts†L16-L21】【F:src/modules/produccion/services/produccion.service.ts†L41-L85】 |
| PUT | `/api/producciones/:id` | Campos parciales (`producto`, `cantidad`, `centro`, `etapa`, `fecha`). | Registro actualizado. | Arroja 400 si no se envía ningún campo modificable o si se intenta cambiar `accessId`; 404 si el ID no existe.【F:src/modules/produccion/routes/produccion.routes.ts†L18-L23】【F:src/modules/produccion/services/produccion.service.ts†L87-L127】 |
| DELETE | `/api/producciones/:id` | — | `{ message: 'Producción eliminada con éxito' }`. | Elimina el registro y recalcula derivados; manejar confirmación en UI.【F:src/modules/produccion/routes/produccion.routes.ts†L23-L27】【F:src/modules/produccion/controllers/produccion.controller.ts†L33-L43】 |

### Producción de crema

Se alimenta desde la importación de Access mediante lotes de objetos (`datos`) y una fecha objetivo. Cada documento mantiene `accessId` para idempotencia.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L10-L49】【F:src/modules/prodcrema/services/produccionCremaPura.service.ts†L1-L96】

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/prodcrema` | `{ "fecha": "YYYY-MM-DD", "datos": [{ id?, ID?, nombredelproducto, cantidad }] }`. | `{ message: 'Producción de crema registrada' }`. | Devuelve 400 si `fecha` falta o `datos` no es arreglo. El servicio sobrescribe registros de la fecha antes de insertar.【F:src/modules/prodcrema/routes/prodcrema.routes.ts†L7-L10】【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L10-L37】 |
| GET | `/api/prodcrema` | — | `[ { _id, accessId, FechaCre, ProdCre, ConsuCre } ]`. | Utilizar filtros en frontend (fecha) ya que la API devuelve todo el historial.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L27-L32】【F:src/modules/prodcrema/entities/prodcrema.model.ts†L5-L29】 |
| PUT | `/api/prodcrema/:id` | Campos parciales (por ejemplo `ProdCre`, `ConsuCre`). | Registro actualizado. | Retorna 404 si el ID no existe.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L33-L46】 |
| DELETE | `/api/prodcrema/:id` | — | 204 sin cuerpo. | Tras eliminar, refrescar totales relacionados en UI.【F:src/modules/prodcrema/controllers/prodcrema.controller.ts†L48-L49】 |

### Litros de crema

Este módulo reprocesa litros destinados a crema a partir de `Insuleche`. El endpoint de creación dispara el proceso completo para la fecha seleccionada.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L10-L43】【F:src/modules/litroscrema/services/litrosCrema.service.ts†L1-L66】

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/litros-crema` | `{ "fecha": "YYYY-MM-DD" }`. | `{ message: 'Litros de crema registrados' }`. | Devuelve 400 si falta `fecha`; el servicio elimina registros de la fecha antes de recalcular e inserta por `accessId`.【F:src/modules/litroscrema/routes/litroscrema.routes.ts†L7-L9】【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L10-L21】 |
| GET | `/api/litros-crema` | — | `[ { _id, Fechalitro, Producto, Monto, accessId } ]`. | No admite filtros server-side; aplicar en cliente.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L23-L27】【F:src/modules/litroscrema/entities/litroscrema.model.ts†L5-L33】 |
| PUT | `/api/litros-crema/:id` | Campos parciales (`Producto`, `Monto`). | Registro actualizado. | 404 si el ID no existe; respeta validaciones de Mongoose.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L28-L39】 |
| DELETE | `/api/litros-crema/:id` | — | `{ message: 'Litros de crema eliminados' }`. | Confirmar antes de eliminar y refrescar listados.【F:src/modules/litroscrema/controllers/litroscrema.controller.ts†L40-L43】 |

### Pérdidas y sobrantes

Ambos módulos almacenan movimientos en kilogramos relacionados con pérdidas de producción y sobrantes recuperados. Requieren validaciones de fecha y números positivos.【F:src/modules/perdida/controllers/perdida.controller.ts†L1-L95】【F:src/modules/sobrante/routes/sobrante.routes.ts†L9-L35】

#### Pérdidas (`/api/perdidas`)

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/perdidas` | — | `[ { _id, FechaPer, GRUPO, PRODUCTO, HORMA, CANTIKG, calculationDate } ]`. | Devuelve todos los registros; aplicar filtros client-side si es necesario.【F:src/modules/perdida/controllers/perdida.controller.ts†L13-L18】 |
| GET | `/api/perdidas/:id` | Parámetro `id` (ObjectId). | Registro puntual. | 400 si el ID no es válido, 404 si no se encuentra.【F:src/modules/perdida/controllers/perdida.controller.ts†L20-L36】 |
| POST | `/api/perdidas` | `{ "FechaPer": "YYYY-MM-DD", "GRUPO"?, "PRODUCTO"?, "HORMA"?, "CANTIKG"?, "calculationDate"? }`. | Pérdida creada con fecha convertida a ISO. | 400 si `FechaPer` es inválida; se completa `calculationDate` con la fecha actual si no se envía.【F:src/modules/perdida/controllers/perdida.controller.ts†L38-L57】 |
| PUT | `/api/perdidas/:id` | Campos parciales (los mismos atributos). | Registro actualizado. | Convierte `FechaPer` a Date y valida formato; responde 400/404 según corresponda.【F:src/modules/perdida/controllers/perdida.controller.ts†L59-L80】 |
| DELETE | `/api/perdidas/:id` | — | `{ message: 'Pérdida eliminada correctamente' }`. | Valida ID antes de eliminar.【F:src/modules/perdida/controllers/perdida.controller.ts†L82-L95】 |

#### Sobrantes (`/api/sobrantes`)

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/sobrantes` | `{ "FechaSob": "YYYY-MM-DD", "GRUPO"?, "PRODUCTO"?, "HORMA"?, "CANTIKG"?, "calculationDate"? }`. | Registro creado. | Utiliza `express-validator` para asegurar fecha válida y campos numéricos; devuelve 400 con mensajes detallados si falla.【F:src/modules/sobrante/routes/sobrante.routes.ts†L9-L24】【F:src/modules/sobrante/controllers/sobrante.controller.ts†L9-L19】 |
| GET | `/api/sobrantes` | — | `[ { _id, FechaSob, GRUPO, PRODUCTO, HORMA, CANTIKG, calculationDate } ]`. | —【F:src/modules/sobrante/controllers/sobrante.controller.ts†L21-L25】 |
| PUT | `/api/sobrantes/:id` | Campos parciales. | Registro actualizado. | 404 si el ID no existe.【F:src/modules/sobrante/controllers/sobrante.controller.ts†L27-L34】 |
| DELETE | `/api/sobrantes/:id` | — | `{ message: 'Sobrante eliminado con éxito' }`. | Confirmar en UI antes de eliminar.【F:src/modules/sobrante/controllers/sobrante.controller.ts†L36-L41】 |

## Distribución y asignaciones

### Asignación actividad-empleado

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/asignacion-actividad-empleado` | Query opcional (`empleado?`, `fecha?`). | Lista de asignaciones. | —【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】 |
| GET | `/api/asignacion-actividad-empleado/:id` | Parámetro `id`. | Detalle de asignación. | —【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】 |
| POST | `/api/asignacion-actividad-empleado` | `{ empleado, actividad, horas, porcentaje, fecha }` | Registro creado. | Validar suma de porcentajes. |【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】【F:src/modules/asignacion-actividad-empleado/entities/asignacion-actividad-empleado.model.ts†L6-L64】 |
| PUT | `/api/asignacion-actividad-empleado/:id` | Campos parciales. | Registro actualizado. | —【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】 |
| DELETE | `/api/asignacion-actividad-empleado/:id` | — | `{ message }`. | —【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】 |

### Asignaciones base

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/asignaciones` | — | Lista `{ _id, desde, hacia, porcentaje, fecha }`. | Ordenar por centro origen/destino para evidenciar acumulados.【F:src/modules/asignacion/routes/asignacion.routes.ts†L15-L21】 |
| GET | `/api/asignaciones/:id` | Parámetro `id`. | Detalle de asignación. | 404 si no existe.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L20-L26】 |
| POST | `/api/asignaciones` | `{ "desde": ObjectId, "hacia": ObjectId, "porcentaje": number, "fecha": 'YYYY-MM-DD' }` | Asignación creada (201) y auditada. | Middleware verifica centros válidos, porcentajes y fecha no futura.【F:src/modules/asignacion/routes/asignacion.routes.ts†L19-L21】【F:src/modules/asignacion/middlewares/validar-asignacion.ts†L15-L79】 |
| PUT | `/api/asignaciones/:id` | Campos parciales. | Asignación actualizada. | Recalcula porcentaje acumulado excluyendo el registro actual.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L40-L53】【F:src/modules/asignacion/services/prorrateo.service.ts†L9-L36】 |
| DELETE | `/api/asignaciones/:id` | — | `{ message: 'Asignación eliminada correctamente' }`. | Registrar en auditoría frontend/UX.【F:src/modules/asignacion/controllers/asignacion.controller.ts†L55-L62】 |
| GET | `/api/asignaciones/costo-final/:centroId` | Parámetro `centroId`. | `{ centro, costoFinal }`. | Consumir tras revisar historial para mostrar resumen económico.【F:src/modules/asignacion/routes/asignacion.routes.ts†L17-L18】【F:src/modules/asignacion/controllers/asignacion.controller.ts†L64-L72】 |

### Asignación de centros

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/asignacion-centro` | — | Lista de asignaciones centro. | —【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】 |
| GET | `/api/asignacion-centro/:id` | Parámetro `id`. | Asignación específica. | —【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】 |
| POST | `/api/asignacion-centro` | `{ centroOrigen, destinos: [...], fecha }` | Asignación creada. | Validar porcentajes. |【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】 |
| PUT | `/api/asignacion-centro/:id` | Campos parciales. | Asignación actualizada. | —【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】 |
| DELETE | `/api/asignacion-centro/:id` | — | `{ message }`. | —【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】 |

### Historial y costos finales

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/asignaciones/historial/:centro` | Parámetro `centro` (ObjectId). | Pasos de prorrateo por centro. | Ordenar por fecha desc.【F:src/modules/asignacion-historial/routes/asignacion-historial.routes.ts†L6-L7】 |
| GET | `/api/centros-apoyo/distribucion` | — | Distribución vigente de centro de apoyo. | Solo lectura.【F:src/modules/centros/routes/distribucion-centro-apoyo.routes.ts†L6-L7】 |
| GET | `/api/costos-finales/:sku` | Parámetro `sku`. | Costos finales por producto. | Integrar con reportes.【F:src/modules/centros/routes/costos-finales.routes.ts†L6-L7】 |
| POST | `/api/asignaciones-manuales` | `{ centro, monto, fecha }` | Pasos aplicados. | Requiere `x-user`.【F:src/modules/centros-asignaciones/routes/centros-asignaciones.routes.ts†L9-L10】 |
| GET | `/api/asignaciones-finales` | Query `centro`. | Costos finales por centro. | Validar query obligatorio.【F:src/modules/centros-asignaciones/routes/centros-asignaciones.routes.ts†L9-L10】 |

## Costos y consolidaciones

### Costos (gastos, depreciaciones, sueldos)

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/costos/gasto-centro` | Query `centro?`, `fechaCalculo?`, `esGastoDelPeriodo?`. | Lista de gastos. | —【F:src/modules/costos/routes/costos.routes.ts†L20-L39】 |
| POST | `/api/costos/gasto-centro` | Objeto o arreglo de gastos. | `{ created?, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L25-L29】【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】 |
| PUT | `/api/costos/gasto-centro/:id` | Campos parciales. | `{ actualizado, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L30-L34】 |
| DELETE | `/api/costos/gasto-centro/:id` | — | `{ message, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L35-L38】 |
| GET | `/api/costos/depreciacion` | Query `centro?`, `fechaCalculo?`. | Lista de depreciaciones. | —【F:src/modules/costos/routes/costos.routes.ts†L40-L59】 |
| POST | `/api/costos/depreciacion` | Objeto o arreglo. | `{ created?, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L45-L48】【F:src/modules/costos/controllers/costos.controller.ts†L112-L166】 |
| PUT | `/api/costos/depreciacion/:id` | Campos parciales. | `{ actualizado, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L50-L54】 |
| DELETE | `/api/costos/depreciacion/:id` | — | `{ message, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L55-L58】 |
| GET | `/api/costos/sueldo` | Query `centro?`, `fechaCalculo?`, `nroEmpleado?`, `esGastoDelPeriodo?`. | Lista de sueldos. | —【F:src/modules/costos/routes/costos.routes.ts†L60-L79】 |
| POST | `/api/costos/sueldo` | Objeto o arreglo. | `{ created?, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L65-L68】【F:src/modules/costos/controllers/costos.controller.ts†L188-L219】 |
| PUT | `/api/costos/sueldo/:id` | Campos parciales. | `{ actualizado, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L70-L74】 |
| DELETE | `/api/costos/sueldo/:id` | — | `{ message, balance, warning? }` | Requiere `x-user`.【F:src/modules/costos/routes/costos.routes.ts†L75-L78】 |
| Panel | — | — | Mostrar última ejecución del prorrateo automático (fecha, balance). | Datos provienen de las respuestas anteriores y del job `CostosSyncService`.【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】 |

### CIF

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/api/cif/total` | `{ producto, periodo, monto, base, accessId? }` | CIF total creado. | 409 si ya existe combinación. |【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/cif/controllers/cif.controller.ts†L20-L50】 |
| POST | `/api/cif/unitario` | `{ producto, periodo, cantidad, accessId? }` | CIF unitario calculado. | 404 si falta CIF total, 400 si `cantidad <= 0`.【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/cif/services/cif.service.ts†L40-L73】 |
| GET | `/api/cif/total/:producto` | Query `periodo?`. | Lista de registros totales. | —【F:src/modules/cif/routes/cif.routes.ts†L7-L11】 |
| GET | `/api/cif/unitario/:producto` | Query `periodo?`. | Lista de registros unitarios. | —【F:src/modules/cif/routes/cif.routes.ts†L7-L11】 |
| POST | `/api/cif/recalcular` | `{ periodo }` | Resultado recalculado. | Puede tardar; mostrar loader. |【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/cif/services/cif.service.ts†L87-L133】 |

### Existencias y asientos de control

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/existencias` | — | `{ existencias: [...], asientos: { debitos, creditos } }` | Poblar dashboard de inventario.【F:src/modules/existencias/routes/existencias.routes.ts†L7-L9】【F:src/modules/existencias/services/existencias.service.ts†L45-L137】 |
| POST | `/api/existencias` | Arreglo `{ producto, cantidad, accessId? }`. | 201 sin cuerpo. | Registrar existencias iniciales.【F:src/modules/existencias/routes/existencias.routes.ts†L7-L9】 |
| POST | `/api/existencias/consolidar` | `{ fecha? }` | 204 sin cuerpo. | Tras consolidar, refrescar asientos.【F:src/modules/existencias/routes/existencias.routes.ts†L7-L9】 |
| GET | `/api/asientos-control` | — | Lista de asientos (`debitos`, `creditos`, `fecha`). | Mostrar balance en UI.【F:src/modules/existencias/routes/asiento-control.routes.ts†L7-L8】 |
| POST | `/api/asientos-control` | `{ debitos, creditos, fecha?, accessId? }` | Asiento creado. | Requiere `x-user`.【F:src/modules/existencias/routes/asiento-control.routes.ts†L7-L8】【F:src/modules/existencias/controllers/asiento-control.controller.ts†L1-L20】 |

## Analítica e importaciones

### Reportes

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| GET | `/api/reportes/cif` | Query `producto?`, `periodo?`, `format?`. | Datos agregados de CIF. | Exportar con `format=csv|xlsx`.【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】【F:src/modules/reportes/services/reports.service.ts†L28-L104】 |
| GET | `/api/reportes/consumos` | Query `producto?`, `periodo?`, `format?`. | Reporte de consumos. | —【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】 |
| GET | `/api/reportes/asignaciones` | Query `centro?`, `periodo?`. | Matriz de asignaciones. | —【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】 |
| GET | `/api/reportes/cuadros` | Query `periodo?`. | Resumen de costos directos/indirectos. | —【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】 |
| GET | `/api/reportes/costos` | Query `periodo?`, `centro?`. | `{ costos, consumos, cif, control }`. | Revisar bandera `consistente`.【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】【F:src/modules/reportes/services/reports.service.ts†L59-L86】 |
| GET | `/api/reportes/comparativo` | Query `periodo?`. | `{ totalEgresos, totalInsumos, diferencia, consistente }`. | Usar para dashboard. |【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】【F:src/modules/reportes/services/reports.service.ts†L88-L104】 |
| GET | `/api/reportes/mano-obra` | Query `periodo?`, `centro?`. | Reporte de mano de obra. | —【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】 |

### Importaciones MDB

| Método | Ruta | Request | Respuesta | Notas |
| --- | --- | --- | --- | --- |
| POST | `/import` | `FormData` (`mdbFile`, `fechaImportacion`). | `{ totalRecords, results: [...] }` | Mostrar progreso por tabla.【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L22】【F:src/modules/importaciones/controllers/importaciones.controller.ts†L37-L198】 |
| GET | `/api/importaciones` | Query opcional (`desde?`, `hasta?`). | Lista de bitácoras. | Soporta rutas legacy `/import/logs`.【F:src/modules/importaciones/routes/importaciones.routes.ts†L23-L32】 |
| GET | `/api/importaciones/:id` | Parámetro `id` (ObjectId). | Bitácora específica. | 404 si no existe.【F:src/modules/importaciones/routes/importaciones.routes.ts†L25-L32】 |
| POST | `/api/importaciones` | `{ fileName, importDate, recordsProcessed, ... }` | Bitácora manual creada. | Validar campos requeridos.【F:src/modules/importaciones/routes/importaciones.routes.ts†L25-L34】 |
| PUT | `/api/importaciones/:id` | Campos parciales. | Bitácora actualizada. | Requiere `x-user`.【F:src/modules/importaciones/routes/importaciones.routes.ts†L27-L34】 |
| DELETE | `/api/importaciones/:id` | — | `{ message: 'Registro eliminado con éxito' }` | Confirmar antes de ejecutar.【F:src/modules/importaciones/routes/importaciones.routes.ts†L35-L37】 |

Esta referencia debe utilizarse junto con los documentos específicos de cada módulo para conocer validaciones de negocio, estructuras de UI y dependencias entre dominios.
