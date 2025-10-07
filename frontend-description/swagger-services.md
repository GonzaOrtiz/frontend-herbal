# Servicios REST expuestos en Swagger

Esta guía detalla cada endpoint publicado en `docs/swagger.json` y amplía la información necesaria para que el frontend consuma los servicios correctamente. Todas las rutas están expuestas sobre la base `http://localhost:3000`.

## Notas globales
- Los endpoints bajo `/api` requieren token Bearer; incluir cabecera `Authorization` en cada request autenticado.
- Cuando el backend valida acciones sensibles registra al usuario mediante la cabecera `x-user`; utilícela en operaciones de costos, importaciones y borrados relevantes.
- Salvo que se indique lo contrario, las respuestas de error adoptan el formato `{ "message": string }` y utilizan los códigos descriptos en Swagger.

## Índice de endpoints (Swagger)

La siguiente tabla resume los recursos expuestos por el backend según el `docs/swagger.json`. Cada fila enlaza con las secciones detalladas más abajo.

| Módulo (tag Swagger) | Método | Ruta | Resumen |
| --- | --- | --- | --- |
| Actividades | `GET` | `/api/actividades` | Obtener todas las actividades |
| Actividades | `POST` | `/api/actividades` | Crear nueva actividad |
| Actividades | `DELETE` | `/api/actividades/{id}` | Eliminar una actividad |
| Actividades | `GET` | `/api/actividades/{id}` | Obtener actividad por ID |
| Actividades | `PUT` | `/api/actividades/{id}` | Actualizar una actividad |
| AsignacionActividadEmpleado | `GET` | `/api/asignacion-actividad-empleado` | Obtener todas las asignaciones de actividad a empleado |
| AsignacionActividadEmpleado | `POST` | `/api/asignacion-actividad-empleado` | Crear nueva asignación de actividad a empleado |
| AsignacionActividadEmpleado | `DELETE` | `/api/asignaciones-actividad-empleado/{id}` | Eliminar una asignación de actividad a empleado |
| AsignacionActividadEmpleado | `PUT` | `/api/asignaciones-actividad-empleado/{id}` | Actualizar una asignación de actividad a empleado |
| AsignacionCentro | `GET` | `/api/asignacion-centro` | Obtener todas las asignaciones de centro |
| AsignacionCentro | `POST` | `/api/asignacion-centro` | Crear nueva asignación de centro |
| AsignacionCentro | `DELETE` | `/api/asignacion-centro/{id}` | Eliminar una asignación de centro |
| AsignacionCentro | `GET` | `/api/asignacion-centro/{id}` | Obtener asignación de centro por ID |
| AsignacionCentro | `PUT` | `/api/asignacion-centro/{id}` | Actualizar una asignación de centro |
| AsignacionHistorial | `GET` | `/api/asignaciones/historial/{centro}` | Obtener historial de asignaciones para un centro |
| Catalogos | `GET` | `/api/catalogos/insumos` | Obtener catálogo de insumos |
| Catalogos | `POST` | `/api/catalogos/insumos` | Crear insumo |
| Catalogos | `POST` | `/api/catalogos/insumos/sync` | Sincronizar insumos |
| Catalogos | `DELETE` | `/api/catalogos/insumos/{id}` | Eliminar insumo |
| Catalogos | `GET` | `/api/catalogos/insumos/{id}` | Obtener insumo por ID |
| Catalogos | `PUT` | `/api/catalogos/insumos/{id}` | Actualizar insumo |
| Catalogos | `GET` | `/api/catalogos/lista-precio` | Obtener catálogo de listas de precios |
| Catalogos | `POST` | `/api/catalogos/lista-precio` | Crear lista de precios |
| Catalogos | `POST` | `/api/catalogos/lista-precio/sync` | Sincronizar listas de precios |
| Catalogos | `DELETE` | `/api/catalogos/lista-precio/{id}` | Eliminar lista de precios |
| Catalogos | `GET` | `/api/catalogos/lista-precio/{id}` | Obtener lista de precios por ID |
| Catalogos | `PUT` | `/api/catalogos/lista-precio/{id}` | Actualizar lista de precios |
| Catalogos | `GET` | `/api/catalogos/maquinarias` | Obtener catálogo de maquinarias |
| Catalogos | `POST` | `/api/catalogos/maquinarias` | Crear maquinaria |
| Catalogos | `POST` | `/api/catalogos/maquinarias/sync` | Sincronizar maquinarias |
| Catalogos | `DELETE` | `/api/catalogos/maquinarias/{id}` | Eliminar maquinaria |
| Catalogos | `GET` | `/api/catalogos/maquinarias/{id}` | Obtener maquinaria por ID |
| Catalogos | `PUT` | `/api/catalogos/maquinarias/{id}` | Actualizar maquinaria |
| CentroApoyo | `GET` | `/api/centros-apoyo` | Obtener el centro de apoyo |
| CentroApoyo | `GET` | `/api/centros-apoyo/gastos` | Obtener gastos del centro de apoyo |
| CentroApoyo | `GET` | `/api/centros-apoyo/{id}` | Obtener centro de apoyo por ID |
| CentroApoyo | `PUT` | `/api/centros-apoyo/{id}` | Actualizar un centro de apoyo |
| CentroProduccion | `GET` | `/api/centros-produccion` | Obtener todos los centros de producción |
| CentroProduccion | `POST` | `/api/centros-produccion` | Crear nuevo centro de producción |
| CentroProduccion | `DELETE` | `/api/centros-produccion/{id}` | Eliminar un centro de producción |
| CentroProduccion | `GET` | `/api/centros-produccion/{id}` | Obtener centro de producción por ID |
| CentroProduccion | `PUT` | `/api/centros-produccion/{id}` | Actualizar un centro de producción |
| CIF | `POST` | `/api/cif/total` | Registrar CIF total |
| CIF | `POST` | `/api/cif/unitario` | Calcular CIF unitario |
| Consumos | `GET` | `/api/consumos` | Listar consumos |
| Consumos | `POST` | `/api/consumos` | Registrar un consumo |
| Costos | `GET` | `/api/costos/depreciacion` | Consultar depreciaciones por centro |
| Costos | `POST` | `/api/costos/depreciacion` | Registrar depreciación (soporta carga masiva) |
| Costos | `GET` | `/api/costos/gasto-centro` | Consultar gastos por centro |
| Costos | `POST` | `/api/costos/gasto-centro` | Registrar gasto por centro (soporta carga masiva) |
| Costos | `GET` | `/api/costos/sueldo` | Consultar sueldos por centro |
| Costos | `POST` | `/api/costos/sueldo` | Registrar sueldos por centro (soporta carga masiva) |
| Empleados | `GET` | `/api/empleados` | Obtener todos los empleados |
| Empleados | `POST` | `/api/empleados` | Crear nuevo empleado |
| Empleados | `DELETE` | `/api/empleados/{id}` | Eliminar un empleado |
| Empleados | `GET` | `/api/empleados/{id}` | Obtener empleado por ID |
| Empleados | `PUT` | `/api/empleados/{id}` | Actualizar un empleado |
| Existencias | `GET` | `/api/existencias` | Obtiene las existencias consolidadas. |
| Existencias | `POST` | `/api/existencias/consolidar` | Consolida movimientos y genera asiento de control. |
| FechaCalculo | `GET` | `/api/fecha-calculo` | Obtener la fecha de cálculo vigente |
| FechaCalculo | `POST` | `/api/fecha-calculo` | Establecer la fecha de cálculo |
| Importación MDB | `POST` | `/import` | Importa un archivo .mdb y guarda los datos en MongoDB |
| Importación MDB | `GET` | `/import/logs` | Lista las bitácoras de importación |
| Importación MDB | `GET` | `/import/logs/{id}` | Obtiene una bitácora de importación por ID |
| LitrosCrema | `GET` | `/api/litros-crema` | Obtener litros de crema |
| LitrosCrema | `POST` | `/api/litros-crema` | Registrar litros de crema de una fecha |
| LitrosCrema | `DELETE` | `/api/litros-crema/{id}` | Eliminar litros de crema |
| LitrosCrema | `PUT` | `/api/litros-crema/{id}` | Actualizar litros de crema |
| Perdidas | `GET` | `/api/perdidas` | Obtener todas las pérdidas |
| Perdidas | `POST` | `/api/perdidas` | Crear nueva pérdida |
| Perdidas | `DELETE` | `/api/perdidas/{id}` | Eliminar una pérdida |
| Perdidas | `GET` | `/api/perdidas/{id}` | Obtener pérdida por ID |
| Perdidas | `PUT` | `/api/perdidas/{id}` | Actualizar una pérdida |
| ProduccionCrema | `GET` | `/api/prodcrema` | Obtener producción de crema |
| ProduccionCrema | `POST` | `/api/prodcrema` | Registrar producción de crema |
| ProduccionCrema | `DELETE` | `/api/prodcrema/{id}` | Eliminar producción de crema |
| ProduccionCrema | `PUT` | `/api/prodcrema/{id}` | Actualizar producción de crema |
| Producciones | `GET` | `/api/producciones` | Listar producciones |
| Producciones | `POST` | `/api/producciones` | Registrar una producción |
| Reportes | `GET` | `/api/reportes/asignaciones` | Reporte de asignaciones. |
| Reportes | `GET` | `/api/reportes/cif` | Reporte de CIF. |
| Reportes | `GET` | `/api/reportes/comparativo` | Comparativo entre egresos e insumos. |
| Reportes | `GET` | `/api/reportes/consumos` | Reporte de consumos. |
| Reportes | `GET` | `/api/reportes/costos` | Consolidado de costos, consumos y CIF. |
| Reportes | `GET` | `/api/reportes/cuadros` | Cuadros de costos por producto. |
| Reportes | `GET` | `/api/reportes/mano-obra` | Resumen de mano de obra por actividad. |
| Sobrante | `GET` | `/api/sobrantes` | Listar productos sobrantes |
| Sobrante | `POST` | `/api/sobrantes` | Registrar producto sobrante |
| Sobrante | `DELETE` | `/api/sobrantes/{id}` | Eliminar un sobrante |
| Sobrante | `PUT` | `/api/sobrantes/{id}` | Actualizar un sobrante |

## Actividades

### GET `/api/actividades`
- **Request**: sin parámetros.
- **Response**: `200 OK` con arreglo de actividades `{ _id, nroAct, nombre }`.
- **Funcionalidad**: recupera el catálogo maestro de actividades productivas.
- **Contexto en frontend**: inicializa la tabla del módulo "Actividades" y llena los selectores de actividad en formularios de asignaciones, costos y reportes.

### POST `/api/actividades`
- **Request**: cuerpo JSON `{ "nombre": string }`.
- **Response**: `201 Created` con la actividad generada `{ _id, nroAct, nombre }`.
- **Funcionalidad**: registra una nueva actividad con correlativo automático.
- **Contexto en frontend**: acción "Nueva actividad" dentro del catálogo; tras guardar refrescar la lista y los combos dependientes.

### GET `/api/actividades/{id}`
- **Request**: parámetro de ruta `id` (ObjectId de MongoDB).
- **Response**: `200 OK` con la actividad solicitada o `404` si no existe.
- **Funcionalidad**: obtiene un registro puntual para edición o lectura.
- **Contexto en frontend**: precarga del formulario de edición al abrir un drawer/modal desde la grilla.

### PUT `/api/actividades/{id}`
- **Request**: parámetro `id` y cuerpo JSON `{ "nombre": string }`.
- **Response**: `200 OK` con la actividad actualizada o `404` cuando no se encuentra.
- **Funcionalidad**: actualiza el nombre de la actividad.
- **Contexto en frontend**: guardar cambios desde el panel de edición; invalidar caches asociados.

### DELETE `/api/actividades/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Actividad eliminada con éxito' }` o `404` si ya no existe.
- **Funcionalidad**: elimina una actividad del catálogo.
- **Contexto en frontend**: botón "Eliminar" de la tabla; mostrar confirmación porque puede dejar combos sin opciones.

## Asignación actividad-empleado

### GET `/api/asignacion-actividad-empleado`
- **Request**: sin parámetros.
- **Response**: `200 OK` con arreglo `[{ _id, nroAsi, empleado: { nroEmp, nombre? }, actividadesRealizadas: [{ horasTrab, actividad: { activTrab, activDescripcion, porActi } }] }]`.
- **Funcionalidad**: lista todas las asignaciones de horas por empleado.
- **Contexto en frontend**: poblar la grilla principal del módulo "Asignación actividad-empleado" y calcular totales locales.

### POST `/api/asignacion-actividad-empleado`
- **Request**: cuerpo JSON `{ nroAsi, empleado: { nroEmp, nombre? }, actividadesRealizadas: [{ horasTrab, actividad: { activTrab, activDescripcion, porActi } }] }`.
- **Response**: `201 Created` con el documento creado; `400` cuando faltan campos o la estructura es inválida.
- **Funcionalidad**: guarda una nueva asignación y valida que existan actividades y porcentajes coherentes.
- **Contexto en frontend**: botón "Guardar" del formulario maestro-detalle al registrar horas del personal.

### PUT `/api/asignaciones-actividad-empleado/{id}`
- **Request**: parámetro `id` y mismo esquema de cuerpo que en la creación.
- **Response**: `200 OK` con el documento actualizado; `400` por validaciones o `404` si el registro no existe.
- **Funcionalidad**: modifica una asignación existente manteniendo la consistencia de horas y porcentajes.
- **Contexto en frontend**: edición desde el side sheet de detalle; tras confirmar, refrescar la tabla y recalcular indicadores.

### DELETE `/api/asignaciones-actividad-empleado/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Asignación eliminada correctamente' }` o `404` si no se encuentra.
- **Funcionalidad**: elimina definitivamente una asignación.
- **Contexto en frontend**: acción de eliminar con confirmación en la tabla del módulo.

## Asignación de centros

### GET `/api/asignacion-centro`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, numero, nCentro, asignacion: [{ base, centroDestino?, porcentaje? }] }]`.
- **Funcionalidad**: recupera todas las configuraciones de distribución entre centros.
- **Contexto en frontend**: listado principal del módulo "Asignación de centros" y exportaciones de auditoría.

### POST `/api/asignacion-centro`
- **Request**: cuerpo JSON `{ nCentro: number, asignacion: [{ base: number, centroDestino?: number, porcentaje?: number }] }`.
- **Response**: `201 Created` con la distribución almacenada; `400` si el arreglo está vacío o carece de bases válidas.
- **Funcionalidad**: crea una nueva regla de prorrateo.
- **Contexto en frontend**: flujo "Nueva distribución"; tras guardar volver a consultar el listado.

### GET `/api/asignacion-centro/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el documento solicitado o `404` cuando no existe.
- **Funcionalidad**: obtiene la configuración para mostrarla o editarla.
- **Contexto en frontend**: precarga del formulario de edición y visualización de detalle.

### PUT `/api/asignacion-centro/{id}`
- **Request**: parámetro `id` y cuerpo JSON con los campos editables `{ nCentro, asignacion: [...] }`.
- **Response**: `200 OK` con la versión actualizada o `404` si no se encuentra.
- **Funcionalidad**: modifica porcentajes y bases de una distribución existente.
- **Contexto en frontend**: acción "Guardar cambios" dentro del mismo módulo; recalcular totales locales.

### DELETE `/api/asignacion-centro/{id}`
- **Request**: parámetro `id`.
- **Response**: `204 No Content` cuando se elimina o `404` si el registro ya no existe.
- **Funcionalidad**: elimina una configuración de prorrateo.
- **Contexto en frontend**: opción de eliminación en la tabla con confirmación, seguida de refresco de datos.

## Historial de asignaciones

### GET `/api/asignaciones/historial/{centro}`
- **Request**: parámetro `centro` (ObjectId del centro de producción).
- **Response**: `200 OK` con `{ centro, fecha, pasos: [{ desde, hacia, porcentaje, monto }] }`.
- **Funcionalidad**: muestra los pasos de prorrateo aplicados a un centro en una fecha dada.
- **Contexto en frontend**: panel analítico del historial de costos donde se detalla cómo se distribuyeron los montos.

## Catálogos

### Insumos

#### GET `/api/catalogos/insumos`
- **Request**: sin parámetros; opcionalmente aplicar filtros client-side.
- **Response**: `200 OK` con `[{ _id, codigo, descripcion, activo, fechaIn, articulo?, cantidad?, monto?, usado? }]`.
- **Funcionalidad**: consulta el inventario de insumos importados desde Access o cargados manualmente.
- **Contexto en frontend**: vista de administración de insumos y autocompletados en formularios de consumos e importaciones.

#### POST `/api/catalogos/insumos`
- **Request**: cuerpo JSON `{ codigo, descripcion, activo?, fechaIn, articulo?, cantidad?, monto?, usado? }`.
- **Response**: `201 Created` con el insumo almacenado; `400` cuando hay errores de validación.
- **Funcionalidad**: crea o complementa el catálogo de insumos operativos.
- **Contexto en frontend**: botón "Nuevo insumo" del catálogo y asistente de altas manuales tras una importación.

#### GET `/api/catalogos/insumos/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el insumo solicitado o `404` si no existe.
- **Funcionalidad**: obtiene el detalle completo de un insumo.
- **Contexto en frontend**: carga del formulario de edición y vistas de detalle.

#### PUT `/api/catalogos/insumos/{id}`
- **Request**: parámetro `id` y cuerpo JSON con campos editables del insumo.
- **Response**: `200 OK` con el registro actualizado; `400` por validaciones o `404` si no se encuentra.
- **Funcionalidad**: actualiza precios, cantidades de referencia o estado activo del insumo.
- **Contexto en frontend**: acción "Guardar" en el modal de edición y procesos de revisión de datos importados.

#### DELETE `/api/catalogos/insumos/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: string }` confirmando el borrado.
- **Funcionalidad**: elimina un insumo del catálogo.
- **Contexto en frontend**: opción de eliminación en la tabla; bloquear cuando el insumo esté referenciado en consumos recientes.

#### POST `/api/catalogos/insumos/sync`
- **Request**: cuerpo JSON `[{ codigo, descripcion, activo?, fechaIn, articulo?, cantidad?, monto?, usado? }, ...]`.
- **Response**: `200 OK` con la lista sincronizada (inserciones/actualizaciones aplicadas).
- **Funcionalidad**: ingesta masiva utilizada tras importar archivos Access.
- **Contexto en frontend**: flujo de sincronización desde la sección de importaciones para conciliar catálogos.

### Listas de precio

#### GET `/api/catalogos/lista-precio`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, codigo, descripcion, activo, nroLista, nombreLista, fechaLista, tipoProd, producto, precioUnit, costoUnit, margen?, litrosLeche?, ganPorLitro?, marCosto?, comision?, flete?, marNetCom?, ganLeche? }]`.
- **Funcionalidad**: lista las políticas de precio vigentes.
- **Contexto en frontend**: tablas de catálogos, selector de listas en reportes comerciales y validaciones al cargar costos.

#### POST `/api/catalogos/lista-precio`
- **Request**: cuerpo JSON con los campos de la lista `{ codigo, descripcion, activo?, nroLista, nombreLista, fechaLista, tipoProd, producto, precioUnit, costoUnit, ... }`.
- **Response**: `201 Created` con la lista guardada o `400` por datos inválidos.
- **Funcionalidad**: registra nuevas listas o versiones importadas.
- **Contexto en frontend**: alta manual desde el administrador de catálogos.

#### GET `/api/catalogos/lista-precio/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el detalle o `404` si no se encuentra.
- **Funcionalidad**: obtiene una lista específica para revisión.
- **Contexto en frontend**: formulario de edición y pantalla de comparación de precios.

#### PUT `/api/catalogos/lista-precio/{id}`
- **Request**: parámetro `id` y cuerpo JSON con los campos a modificar.
- **Response**: `200 OK` con la versión actualizada; `400`/`404` según corresponda.
- **Funcionalidad**: ajusta precios, márgenes y metadatos.
- **Contexto en frontend**: guardado de ajustes realizados por el área comercial.

#### DELETE `/api/catalogos/lista-precio/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: string }`.
- **Funcionalidad**: elimina una lista redundante o con errores.
- **Contexto en frontend**: acción de limpieza posterior a importaciones fallidas.

#### POST `/api/catalogos/lista-precio/sync`
- **Request**: cuerpo JSON con un arreglo de listas en el mismo formato del alta.
- **Response**: `200 OK` con los registros sincronizados.
- **Funcionalidad**: actualiza masivamente listas desde Access o Excel.
- **Contexto en frontend**: paso automático al concluir una importación MDB para refrescar precios.

### Maquinarias

#### GET `/api/catalogos/maquinarias`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, codigo, descripcion, activo, nCentro, maqui, fechaDem, horasDisp?, capacidad? }]`.
- **Funcionalidad**: devuelve el inventario de maquinarias por centro.
- **Contexto en frontend**: vista de catálogo y combos que alimentan la distribución de costos por activo.

#### POST `/api/catalogos/maquinarias`
- **Request**: cuerpo JSON `{ codigo, descripcion, activo?, nCentro, maqui, fechaDem, horasDisp?, capacidad? }`.
- **Response**: `201 Created` con la maquinaria registrada o `400` si los datos no cumplen las reglas.
- **Funcionalidad**: da de alta equipos productivos.
- **Contexto en frontend**: formulario de registro cuando se instala un nuevo equipo o se corrige información importada.

#### GET `/api/catalogos/maquinarias/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con la maquinaria solicitada o `404` si no existe.
- **Funcionalidad**: obtiene el detalle para auditoría.
- **Contexto en frontend**: prellenar formularios de edición y popovers informativos.

#### PUT `/api/catalogos/maquinarias/{id}`
- **Request**: parámetro `id` y cuerpo JSON con los campos modificables.
- **Response**: `200 OK` con el recurso actualizado; `400`/`404` ante errores.
- **Funcionalidad**: mantiene actualizados los datos de capacidad u horas disponibles.
- **Contexto en frontend**: guardado de cambios desde la UI de catálogo y ajustes posteriores a mantenimientos.

#### DELETE `/api/catalogos/maquinarias/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: string }`.
- **Funcionalidad**: elimina una maquinaria dada de baja.
- **Contexto en frontend**: acción de baja lógica tras confirmación del área de operaciones.

#### POST `/api/catalogos/maquinarias/sync`
- **Request**: cuerpo JSON con arreglo de maquinarias.
- **Response**: `200 OK` con la colección sincronizada.
- **Funcionalidad**: permite actualizaciones masivas provenientes de Access.
- **Contexto en frontend**: paso automatizado dentro del wizard de importación para garantizar consistencia con la base legada.


## Centros de apoyo

### GET `/api/centros-apoyo`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, nroCentro, nombre }]`.
- **Funcionalidad**: lista los centros de apoyo definidos en el sistema.
- **Contexto en frontend**: catálogo de centros auxiliares y combos usados en reportes de distribución.

### GET `/api/centros-apoyo/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el centro solicitado o `404` si no se encuentra.
- **Funcionalidad**: obtiene un centro específico para revisión.
- **Contexto en frontend**: carga de formularios de edición y tarjetas informativas.

### PUT `/api/centros-apoyo/{id}`
- **Request**: parámetro `id` y cuerpo JSON `{ nombre: string }`.
- **Response**: `200 OK` con el registro actualizado o `404` cuando no existe.
- **Funcionalidad**: renombra un centro de apoyo.
- **Contexto en frontend**: acción "Guardar" tras editar el nombre desde el catálogo.

### GET `/api/centros-apoyo/gastos`
- **Request**:
  - **Query params opcionales**:
    - `fechaCalculo` (`YYYY-MM-DD`) — filtra los gastos registrados para una fecha específica.
    - `esGastoDelPeriodo` (`true|false`) — limita la respuesta a gastos del período actual o diferidos.
- **Response**: `200 OK` con gastos `{ _id, centro, concepto, monto, fechaCalculo, esGastoDelPeriodo, tablaOrigen }`.
- **Funcionalidad**: consulta gastos indirectos asociados al centro de apoyo general.
- **Contexto en frontend**: panel analítico de costos indirectos y validación posterior a importaciones MDB.

## Centros de producción

### GET `/api/centros-produccion`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, nroCentro, nombre }]`.
- **Funcionalidad**: lista los centros productivos habilitados.
- **Contexto en frontend**: catálogo principal, selectores en asignaciones y filtros de reportes.

### POST `/api/centros-produccion`
- **Request**: cuerpo JSON `{ nroCentro: number, nombre: string }`.
- **Response**: `201 Created` con el centro creado; `400` si faltan datos.
- **Funcionalidad**: registra nuevos centros productivos.
- **Contexto en frontend**: modal "Nuevo centro" dentro del catálogo.

### GET `/api/centros-produccion/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el centro buscado o `404` si no existe.
- **Funcionalidad**: obtiene información puntual.
- **Contexto en frontend**: precarga de formularios de edición.

### PUT `/api/centros-produccion/{id}`
- **Request**: parámetro `id` y cuerpo JSON `{ nombre: string }`.
- **Response**: `200 OK` con el centro actualizado o `404` si no existe.
- **Funcionalidad**: modifica el nombre visible del centro.
- **Contexto en frontend**: acción de guardado tras editar datos básicos.

### DELETE `/api/centros-produccion/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Centro de producción eliminado con éxito' }` o `404` cuando ya no existe.
- **Funcionalidad**: elimina un centro que no se utilizará más.
- **Contexto en frontend**: opción de baja con confirmación y refresco de catálogos dependientes.


## Costos indirectos de fabricación (CIF)

### POST `/api/cif/total`
- **Request**: cuerpo JSON `{ producto: string, periodo: 'YYYY-MM-DD', monto: number, base: number, accessId?: string }`.
- **Response**: `201 Created` con el registro `{ _id, producto, periodo, monto, base, accessId?, createdAt }`; `409` si ya existe el par producto+periodo.
- **Funcionalidad**: registra el monto total de CIF para un producto en un período determinado.
- **Contexto en frontend**: formulario de carga del módulo "CIF" y paso posterior a importar costos.

### POST `/api/cif/unitario`
- **Request**: cuerpo JSON `{ producto: string, periodo: 'YYYY-MM-DD', cantidad: number, accessId?: string }`.
- **Response**: `201 Created` con `{ producto, periodo, costoUnitario, cantidad }`; `400` si la cantidad es <= 0 o `404` cuando no existe el CIF total previo.
- **Funcionalidad**: calcula y guarda el CIF unitario a partir del total registrado.
- **Contexto en frontend**: acción "Calcular CIF unitario" tras asegurar que el total esté cargado y la producción validada.

## Consumos de insumos

### GET `/api/consumos`
- **Request**:
  - **Query params opcionales**:
    - `producto` (string) — filtra por código o nombre del producto.
    - `desde` y `hasta` (string, formato `YYYY-MM-DD`) — acotan el rango de fechas a consultar.
- **Response**: `200 OK` con `[{ _id, producto, insumo, cantidad, unidad, tipoProd?, fecha, calculationDate? }]`.
- **Funcionalidad**: lista los consumos de insumos registrados en el período solicitado.
- **Contexto en frontend**: tabla principal del módulo "Consumos" y filtros analíticos para reportes.

### POST `/api/consumos`
- **Request**:
  - **Headers**: `Authorization` y `x-user` (identificador del operador que registra el consumo).
  - **Body JSON**: `{ producto, insumo, cantidad, unidad, tipoProd?, fecha, calculationDate?, accessId? }`. Los campos numéricos deben ser mayores a cero y la fecha válida.
- **Response**: `201 Created` con el consumo almacenado; `400` cuando los datos son inválidos.
- **Funcionalidad**: registra un nuevo consumo de insumos asociándolo a producto y fecha.
- **Contexto en frontend**: formulario de captura manual y confirmación de importaciones parciales.

## Costos operativos

### GET `/api/costos/gasto-centro`
- **Request**:
  - **Query params opcionales**:
    - `centro` (number) — filtra por número de centro de producción/apoyo.
    - `fechaCalculo` (`YYYY-MM-DD`) — acota los gastos al ciclo operativo activo.
    - `esGastoDelPeriodo` (`true|false`) — muestra únicamente gastos del período o gastos diferidos.
- **Response**: `200 OK` con gastos `{ _id, centro, fecha, concepto, monto, tipo?, fechaCalculo, esGastoDelPeriodo, tablaOrigen?, detalle? }`.
- **Funcionalidad**: consulta los gastos operativos por centro de producción o apoyo.
- **Contexto en frontend**: módulo "Costos" pestaña "Gastos" y validaciones luego de importar Access.

### POST `/api/costos/gasto-centro`
- **Request**:
  - **Headers**: `Authorization`, `x-user` (responsable de la carga) y `Content-Type: application/json`.
  - **Body JSON**: objeto o arreglo con `{ centro, fecha, concepto?, monto, tipo?, fechaCalculo, esGastoDelPeriodo?, tablaOrigen?, accessId?, detalle? }`. Permite cargas masivas y recalcula balances.
- **Response**: `201 Created` con `{ created: number, skipped?: number, balance: { importado, distribuido, diferencia }, warning? }`.
- **Funcionalidad**: registra gastos individuales o masivos y devuelve el balance global contra los montos distribuidos.
- **Contexto en frontend**: carga manual y resultado del import wizard; mostrar alertas cuando `warning` esté presente.

### GET `/api/costos/depreciacion`
- **Request**:
  - **Query params opcionales** `centro`, `fechaCalculo`, `esGastoDelPeriodo` con el mismo significado que en `gasto-centro`.
- **Response**: `200 OK` con registros `{ _id, centro, maquina, depreMensual, vidaUtil?, valorUso?, fechaCalculo, esGastoDelPeriodo?, periodo? }`.
- **Funcionalidad**: lista las depreciaciones cargadas para maquinarias.
- **Contexto en frontend**: pestaña "Depreciaciones" del módulo de costos.

### POST `/api/costos/depreciacion`
- **Request**:
  - **Headers**: `Authorization`, `x-user`, `Content-Type: application/json`.
  - **Body JSON**: objeto o arreglo con `{ centro, maquina, depreMensual, vidaUtil?, valorUso?, fechaCalculo, periodo?, esGastoDelPeriodo?, accessId? }`.
- **Response**: `201 Created` con resumen `{ created, skipped?, balance, warning? }`.
- **Funcionalidad**: registra depreciaciones y recalcula el balance de costos.
- **Contexto en frontend**: cargas manuales y procesos de importación; mostrar el balance devuelto en la UI.

### GET `/api/costos/sueldo`
- **Request**: queries `centro?`, `fechaCalculo?`, `nroEmpleado?`, `esGastoDelPeriodo?` con las mismas reglas de filtrado mencionadas.
- **Response**: `200 OK` con `{ _id, centro, nroEmpleado, fechaSueldo, sueldoTotal, fechaCalculo, esGastoDelPeriodo? }`.
- **Funcionalidad**: recupera los sueldos registrados por centro.
- **Contexto en frontend**: pestaña "Sueldos" y reportes de mano de obra.

### POST `/api/costos/sueldo`
- **Request**:
  - **Headers**: `Authorization`, `x-user`, `Content-Type: application/json`.
  - **Body JSON**: objeto o arreglo `{ centro, nroEmpleado, fechaSueldo, sueldoTotal, fechaCalculo, esGastoDelPeriodo?, accessId? }`.
- **Response**: `201 Created` con `{ created, skipped?, balance, warning? }`.
- **Funcionalidad**: carga sueldos y devuelve el estado del balance global.
- **Contexto en frontend**: botón "Registrar sueldos" y cierre del asistente de importación.


## Empleados

### GET `/api/empleados`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, Nroem, nombre }]`.
- **Funcionalidad**: lista el personal registrado.
- **Contexto en frontend**: catálogo de empleados y autocompletado en asignaciones y sueldos.

### POST `/api/empleados`
- **Request**: cuerpo JSON `{ nombre: string }` (el número se genera automáticamente).
- **Response**: `201 Created` con `{ _id, Nroem, nombre }`.
- **Funcionalidad**: da de alta un empleado.
- **Contexto en frontend**: flujo "Nuevo empleado" dentro del catálogo.

### GET `/api/empleados/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el empleado solicitado o `404` si no existe.
- **Funcionalidad**: obtiene datos para edición.
- **Contexto en frontend**: precarga de formularios y vistas detalle.

### PUT `/api/empleados/{id}`
- **Request**: parámetro `id` y cuerpo JSON `{ nombre: string }`.
- **Response**: `200 OK` con el empleado actualizado; `400` si el nombre está vacío o `404` si no existe.
- **Funcionalidad**: actualiza el nombre visible.
- **Contexto en frontend**: acción "Guardar" al editar un registro.

### DELETE `/api/empleados/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Empleado eliminado correctamente' }` o `404` si el registro no existe.
- **Funcionalidad**: elimina un empleado.
- **Contexto en frontend**: botón de baja con confirmación, bloqueando la acción si hay asignaciones activas.

## Existencias y asientos de control

### GET `/api/existencias`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `{ existencias: [{ producto, cantidadInicial, movimientos: [{ tipo, cantidad, horma }], cantidadFinal }], asientos: { debitos, creditos } }`.
- **Funcionalidad**: consolida inventario físico y movimientos para dashboards.
- **Contexto en frontend**: tablero de existencias y tarjetas de balance en tiempo real.

### POST `/api/existencias/consolidar`
- **Request**: sin cuerpo; utiliza la fecha de cálculo del contexto.
- **Response**: `204 No Content` tras consolidar movimientos y generar asiento contable.
- **Funcionalidad**: recalcula existencias acumuladas.
- **Contexto en frontend**: botón "Consolidar existencias" disponible para usuarios administradores.

## Fecha de cálculo

### GET `/api/fecha-calculo`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `{ date: 'YYYY-MM-DD' }`.
- **Funcionalidad**: obtiene la fecha operativa vigente.
- **Contexto en frontend**: banner o header global que muestra la fecha activa y define filtros por defecto.

### POST `/api/fecha-calculo`
- **Request**: cuerpo JSON `{ date: 'YYYY-MM-DD', createdBy: string, accessId?: string }`.
- **Response**: `201 Created` con el registro persistido o `400` si la fecha es inválida.
- **Funcionalidad**: establece una nueva fecha de cálculo y dispara procesos dependientes.
- **Contexto en frontend**: cambio de fecha desde la configuración global; tras confirmarse, invalidar caches y refrescar dashboards.


## Importación MDB

### POST `/import`
- **Request**:
  - **Headers**: `Authorization`, `x-user`.
  - **Multipart form-data**:
    - `mdbFile` (file, obligatorio) — base Access a importar.
    - `fechaImportacion` (`YYYY-MM-DD`, obligatorio) — fecha de cálculo asociada.
- **Response**: `200 OK` con `{ totalRecords, results: [{ table, collection, inserted, error? }], durationMs }`; `400` si faltan parámetros, `409` cuando ya existe una importación para la fecha y `500` ante fallas de procesamiento.
- **Funcionalidad**: procesa archivos Access y los distribuye en las colecciones correspondientes.
- **Contexto en frontend**: paso principal del asistente de importación; mostrar progreso y detalle de tablas procesadas.

### GET `/import/logs`
- **Request**: sin parámetros.
- **Response**: `200 OK` con bitácoras `{ _id, fileName, importDate, recordsProcessed, errorMessages, durationMs }`.
- **Funcionalidad**: lista históricos de importaciones realizadas.
- **Contexto en frontend**: pantalla de auditoría y trazabilidad de integraciones.

### GET `/import/logs/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con la bitácora solicitada o `404` si no se encuentra.
- **Funcionalidad**: consulta el detalle de una importación concreta.
- **Contexto en frontend**: detalle expandible en la vista de logs y al hacer seguimiento de incidencias.

## Litros de crema

### GET `/api/litros-crema`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, Fechalitro, Producto, Monto, accessId? }]`.
- **Funcionalidad**: devuelve los litros destinados a crema registrados.
- **Contexto en frontend**: tabla del módulo "Litros de crema" y gráficos comparativos.

### POST `/api/litros-crema`
- **Request**: cuerpo JSON `{ fecha: 'YYYY-MM-DD' }`.
- **Response**: `201 Created` con `{ message: 'Litros de crema registrados' }`.
- **Funcionalidad**: recalcula los litros de crema para la fecha indicada (elimina datos previos y recalcula).
- **Contexto en frontend**: botón "Recalcular"; mostrar loader porque implica reprocesamiento.

### PUT `/api/litros-crema/{id}`
- **Request**: parámetro `id` y cuerpo JSON con campos editables (ej. `{ Producto?: string, Monto?: number }`).
- **Response**: `200 OK` con el registro actualizado o `404` si no existe.
- **Funcionalidad**: ajusta manualmente un registro específico.
- **Contexto en frontend**: edición puntual desde la tabla cuando se detecta un ajuste contable.

### DELETE `/api/litros-crema/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Litros de crema eliminados' }` o `404` si no se encuentra.
- **Funcionalidad**: elimina un registro de litros de crema.
- **Contexto en frontend**: acción de limpieza previa a volver a calcular una fecha concreta.

## Pérdidas

### GET `/api/perdidas`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, FechaPer, GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate? }]`.
- **Funcionalidad**: lista las pérdidas registradas en el sistema.
- **Contexto en frontend**: tabla del módulo "Pérdidas" y base para reportes de merma.

### POST `/api/perdidas`
- **Request**: cuerpo JSON `{ FechaPer: 'YYYY-MM-DD', GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate?, accessId? }`.
- **Response**: `201 Created` con la pérdida almacenada; `400` si la fecha no es válida.
- **Funcionalidad**: registra pérdidas de producción.
- **Contexto en frontend**: formulario de alta rápida dentro del módulo y acciones posteriores a importación.

### GET `/api/perdidas/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con el registro solicitado; `400` si el ID es inválido o `404` cuando no existe.
- **Funcionalidad**: recupera una pérdida específica.
- **Contexto en frontend**: detalle al editar o mostrar información contextual.

### PUT `/api/perdidas/{id}`
- **Request**: parámetro `id` y cuerpo JSON con los campos a modificar (mismos atributos que en el alta).
- **Response**: `200 OK` con la pérdida actualizada; `400`/`404` según validaciones.
- **Funcionalidad**: corrige datos registrados previamente.
- **Contexto en frontend**: acción "Guardar" desde la vista de edición.

### DELETE `/api/perdidas/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Pérdida eliminada correctamente' }` o errores `400`/`404`.
- **Funcionalidad**: elimina un registro de pérdidas.
- **Contexto en frontend**: botón de eliminación con confirmación, especialmente tras reprocesar importaciones.


## Producción de crema pura

### GET `/api/prodcrema`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, accessId?, FechaCre, ProdCre, ConsuCre }]`.
- **Funcionalidad**: muestra el historial de producción de crema proveniente de Access o cargas manuales.
- **Contexto en frontend**: tabla del módulo "Producción de crema" y validación de importaciones.

### POST `/api/prodcrema`
- **Request**: cuerpo JSON `{ fecha: 'YYYY-MM-DD', datos: [{ accessId?, FechaCre?, ProdCre?, ConsuCre? }] }`.
- **Response**: `201 Created` con `{ message: 'Producción de crema registrada' }`; `400` si faltan `datos` o `fecha`.
- **Funcionalidad**: reprocesa la producción de crema para la fecha indicada.
- **Contexto en frontend**: acción de importación manual cuando se recibe un nuevo archivo Access parcial.

### PUT `/api/prodcrema/{id}`
- **Request**: parámetro `id` y cuerpo JSON con campos a modificar.
- **Response**: `200 OK` con el registro actualizado o `404` cuando no se encuentra.
- **Funcionalidad**: corrige información específica de un lote de producción.
- **Contexto en frontend**: edición puntual en la tabla para ajustar consumos o descripciones.

### DELETE `/api/prodcrema/{id}`
- **Request**: parámetro `id`.
- **Response**: `204 No Content` si se elimina o `404` si no existe.
- **Funcionalidad**: elimina un registro de producción de crema.
- **Contexto en frontend**: limpieza previa a reimportar datos erróneos.

## Producciones

### GET `/api/producciones`
- **Request**: queries opcionales `producto`, `desde`, `hasta` (`YYYY-MM-DD`).
- **Response**: `200 OK` con `[{ _id, producto, cantidad, centro, etapa, fecha, calculationDate?, accessId? }]`; `500` si ocurre un error interno.
- **Funcionalidad**: lista las producciones registradas filtradas por producto o rango de fechas.
- **Contexto en frontend**: vista principal del módulo "Producciones" y base para reportes de existencias.

### POST `/api/producciones`
- **Request**: cuerpo JSON `{ producto: string, cantidad: number, centro: number, etapa: string, fecha: 'YYYY-MM-DD', calculationDate?, accessId? }`.
- **Response**: `201 Created` con el registro generado; `400` por validaciones y `500` ante errores de servidor.
- **Funcionalidad**: registra producción terminada o en proceso.
- **Contexto en frontend**: formulario de captura manual cuando se carga producción diaria.

## Reportes

### GET `/api/reportes/cif`
- **Request**:
  - **Query params opcionales**:
    - `producto` (string) — limita el reporte a un producto.
    - `periodo` (`YYYY-MM`) — define el ciclo a consultar.
    - `format` (`json|csv|xlsx`) — selecciona la representación de salida y ajusta los encabezados de respuesta.
- **Response**: `200 OK` con arreglo de CIF agregado por período o archivo descargable.
- **Funcionalidad**: expone reportes de CIF para análisis financiero.
- **Contexto en frontend**: módulo de reportes, pestaña "CIF" con opción de exportación.

### GET `/api/reportes/consumos`
- **Request**:
  - **Query params opcionales**: `producto`, `desde`, `hasta`, `format` con la misma semántica que en el reporte de CIF.
- **Response**: `200 OK` con resumen de consumos filtrado o archivo exportable.
- **Funcionalidad**: provee consumos agregados por producto y período.
- **Contexto en frontend**: dashboards de consumo y exportaciones operativas.

### GET `/api/reportes/asignaciones`
- **Request**:
  - **Query params opcionales**: `centro` (número), `desde`, `hasta` (`YYYY-MM-DD`) y `format` (`json|csv|xlsx`).
- **Response**: `200 OK` con matriz de asignaciones entre centros.
- **Funcionalidad**: consolida la distribución de costos por centro.
- **Contexto en frontend**: reportes de prorrateo y descarga para auditoría.

### GET `/api/reportes/cuadros`
- **Request**:
  - **Query param opcional** `periodo` (`YYYY-MM`) — define el mes a consolidar.
- **Response**: `200 OK` con cuadros de costos directos e indirectos por producto.
- **Funcionalidad**: resume costos para presentación ejecutiva.
- **Contexto en frontend**: sección "Cuadros comparativos" y exportación mensual.

### GET `/api/reportes/mano-obra`
- **Request**:
  - **Query params opcionales** `periodo` (`YYYY-MM`) y `centro` (número) para delimitar la búsqueda.
- **Response**: `200 OK` con horas y montos agrupados por actividad/centro.
- **Funcionalidad**: analiza la mano de obra declarada.
- **Contexto en frontend**: pestaña de reportes enfocada en recursos humanos.

### GET `/api/reportes/costos`
- **Request**: queries `periodo?`, `producto?`, `centro?` para definir el alcance del reporte integral.
- **Response**: `200 OK` con `{ costos, consumos, cif, control: { consistente: boolean, diferencia } }`.
- **Funcionalidad**: integra costos, consumos y CIF para validaciones de consistencia.
- **Contexto en frontend**: tablero ejecutivo que alerta diferencias entre importado vs distribuido.

### GET `/api/reportes/comparativo`
- **Request**: queries `periodo?`, `producto?`, `centro?` replicando los filtros del reporte de costos.
- **Response**: `200 OK` con `{ totalEgresos, totalInsumos, diferencia, consistente }`.
- **Funcionalidad**: compara egresos vs insumos para detectar desbalances.
- **Contexto en frontend**: widget comparativo en el dashboard principal.

## Sobrantes

### GET `/api/sobrantes`
- **Request**: sin parámetros.
- **Response**: `200 OK` con `[{ _id, FechaSob, GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate? }]`.
- **Funcionalidad**: lista los sobrantes recuperados.
- **Contexto en frontend**: tabla del módulo "Sobrantes" y gráficos de recuperación.

### POST `/api/sobrantes`
- **Request**: cuerpo JSON `{ FechaSob: 'YYYY-MM-DD', GRUPO?, PRODUCTO?, HORMA?, CANTIKG?, calculationDate?, accessId? }`.
- **Response**: `201 Created` con el registro creado; `400` si la validación falla.
- **Funcionalidad**: registra sobrantes devueltos al proceso.
- **Contexto en frontend**: formulario de alta en el módulo y confirmaciones tras importaciones.

### PUT `/api/sobrantes/{id}`
- **Request**: parámetro `id` y cuerpo JSON con campos a modificar.
- **Response**: `200 OK` con el registro actualizado o `404` cuando no existe.
- **Funcionalidad**: corrige un sobrante cargado previamente.
- **Contexto en frontend**: edición en línea dentro de la tabla.

### DELETE `/api/sobrantes/{id}`
- **Request**: parámetro `id`.
- **Response**: `200 OK` con `{ message: 'Sobrante eliminado' }` o `404` si ya no se encuentra.
- **Funcionalidad**: elimina un registro de sobrantes.
- **Contexto en frontend**: acción de limpieza tras detectar registros duplicados o erróneos.

