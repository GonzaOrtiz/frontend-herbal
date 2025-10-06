# Blueprint funcional del frontend

Este documento resume cómo se organizan los módulos funcionales, qué secciones de UI requiere cada uno y qué endpoints deben consumirse desde el frontend. Úselo como mapa maestro para planear la navegación, componer vistas reutilizables y entender dependencias entre dominios.

## Dominios y rutas principales

El backend expone rutas REST agrupadas por dominio bajo el prefijo `/api`. La siguiente tabla propone cómo agrupar esas rutas en el frontend para construir un menú consistente.

| Dominio | Submódulos | Rutas principales |
| --- | --- | --- |
| **Catálogos y configuración** | Actividades, Empleados, Centros de producción, Centros de apoyo, Catálogos (insumos/listas/maquinarias), Fecha de cálculo | `/api/actividades`, `/api/empleados`, `/api/centros-produccion`, `/api/centros-apoyo`, `/api/catalogos/*`, `/api/fecha-calculo`【F:src/index.ts†L8-L115】 |
| **Operación diaria** | Consumos, Producciones, Producción de crema, Litros de crema, Pérdidas, Sobrantes | `/api/consumos`, `/api/producciones`, `/api/prodcrema`, `/api/litros-crema`, `/api/perdidas`, `/api/sobrantes`【F:src/index.ts†L101-L115】 |
| **Asignaciones y distribución** | Asignación actividad-empleado, Asignación de centros, Historial de asignaciones, Centros (distribución y costos finales) | `/api/asignacion-actividad-empleado`, `/api/asignacion-centro`, `/api/asignaciones/historial/:centro`, `/api/centros-apoyo/distribucion`, `/api/costos-finales/:sku`【F:src/index.ts†L93-L114】【F:src/modules/asignacion-historial/routes/asignacion-historial.routes.ts†L6-L8】【F:src/modules/centros/routes/costos-finales.routes.ts†L6-L8】 |
| **Costos y consolidaciones** | Costos (gasto, depreciación, sueldo, prorrateo), CIF, Existencias y asientos, Centros-asignaciones, Importaciones MDB | `/api/costos/*`, `/api/cif/*`, `/api/existencias`, `/api/asientos-control`, `/api/asignaciones-manuales`, `/api/importaciones`【F:src/index.ts†L100-L115】【F:src/modules/costos/routes/costos.routes.ts†L19-L73】【F:src/modules/cif/routes/cif.routes.ts†L7-L11】【F:src/modules/existencias/routes/existencias.routes.ts†L7-L10】【F:src/modules/centros-asignaciones/routes/centros-asignaciones.routes.ts†L9-L10】【F:src/modules/importaciones/routes/importaciones.routes.ts†L28-L42】 |
| **Analítica y reportes** | Reportes operativos y financieros | `/api/reportes/*`【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】 |

> **Tip**: cada dominio puede convertirse en un submenú con rutas hijas que carguen componentes de lista y detalle. Mantener la jerarquía facilita reutilizar layouts y guardas de navegación.

## Arquitectura propuesta del frontend

### App shell y navegación persistente

- **Barra superior**: contiene selector de fecha de cálculo, atajos a reportes recientes y menú de usuario. El selector debe disparar `GET /api/fecha-calculo` al cargar y `POST /api/fecha-calculo` al actualizar, invalidando caches compartidos para que módulos como Costos y Existencias reciban la nueva fecha.【F:src/index.ts†L91-L115】【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】
- **Menú lateral**: agrupa dominios usando las rutas declaradas en `src/index.ts`. Mantener orden recomendado: Configuración → Operación → Distribución → Costos → Analítica. Cada entrada abre vistas maestras (tablas) y permite navegación secundaria mediante rutas hijas (`/detalle/:id`).【F:src/index.ts†L91-L115】
- **Área de contenido**: renderiza listas + paneles de detalle. Implementar layout con ancho flexible y soporte para paneles laterales (drawers) que se activan desde tablas (editar, ver auditoría).

### Dashboard inicial

El home del sistema debe ofrecer visión consolidada del período activo:

- **Indicadores contables**: tarjetas que consumen `GET /api/reportes/comparativo` y muestran `totalEgresos`, `totalInsumos`, `diferencia`, resaltando el estado `consistente` mediante colores.【F:src/modules/reportes/services/reports.service.ts†L88-L104】
- **Movimientos críticos**: tabla compacta con últimos registros de Consumos (`GET /api/consumos?limit=5`) y Producciones (`GET /api/producciones?limit=5`) para detectar anomalías tempranas.【F:src/modules/consumo/routes/consumo.routes.ts†L16-L27】【F:src/modules/produccion/routes/produccion.routes.ts†L16-L27】
- **Alertas de procesos**: banner cuando exista sincronización de catálogos o costos en curso; puede consultarse mediante flags internos o al detectar resultados con `warning` en las respuestas de Costos y reportes.【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】

### Secciones clave del menú

- **Configuración**: accesos a Actividades, Empleados, Centros de producción y Fecha de cálculo. Cada módulo comparte patrones CRUD, por lo que conviene reutilizar componentes de tabla, modal y confirmaciones.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】
- **Operación diaria**: agrupa Consumos, Producciones, Producción/Litros de crema, Pérdidas y Sobrantes. Requiere filtros por fecha/período y badges para `accessId` que identifiquen importaciones.【F:src/modules/litroscrema/routes/litroscrema.routes.ts†L7-L15】【F:src/modules/sobrante/routes/sobrante.routes.ts†L9-L35】
- **Distribución y asignaciones**: módulos de asignación de actividades, centros y su historial. Incluir vistas maestro-detalle con validación visual de porcentajes y horas totales antes de guardar.【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】
- **Costos y consolidaciones**: acceso directo a Costos, CIF, Existencias/Asientos y Asignaciones manuales. Estas vistas comparten necesidad de mostrar balances (`debitos`, `creditos`, `balance`) y monitorear procesos prolongados como el prorrateo automático y las consolidaciones.【F:src/modules/costos/routes/costos.routes.ts†L19-L73】【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】【F:src/modules/existencias/routes/existencias.routes.ts†L7-L10】
- **Analítica**: sección para Reportes y descargas. Preparar componentes que soporten exportaciones (`format=csv|xlsx`) y múltiples paneles simultáneos.【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】

### Estado global y sincronización de datos

- **Contexto de fecha**: exponer hook/servicio global que lea `req.context.calculationDate` y se actualice tras cada POST. Forzar refresco de queries dependientes (Costos, Reportes, Existencias).【F:src/modules/fecha-calculo/middleware.ts†L9-L21】
- **Catálogos reutilizables**: mantener caches para actividades, centros, empleados e insumos. Invalidar tras operaciones de escritura o sincronizaciones (`/api/catalogos/*/sync`).【F:src/modules/catalogos/controllers/catalog.controller.ts†L20-L70】
- **Cabeceras estándar**: centralizar token Bearer y `x-user` en interceptor. `x-user` es obligatorio en endpoints críticos (Costos, Consumos, Importaciones) para conservar auditoría.【F:src/modules/costos/controllers/costos.controller.ts†L63-L202】【F:src/modules/consumo/controllers/consumo.controller.ts†L36-L55】【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
- **Manejo de errores**: toda respuesta de error llega como `{ "message": string }`. Implementar capa global que muestre toasts y mapee mensajes a formularios cuando sea posible.【F:src/common/middlewares/error-handler.ts†L3-L16】

### Componentes reutilizables sugeridos

- **Tabla densa con modo maestro-detalle**: utilizada por Costos, Asignaciones y Consumos. Debe soportar edición inline opcional, exportaciones y selección múltiple.
- **Wizard de procesos largos**: Importaciones y Consolidaciones requieren pasos (subir archivo → validar → confirmar). Diseñar wizard con resumen final y botones contextuales (`Ver en módulo`).【F:src/modules/importaciones/controllers/importaciones.controller.ts†L37-L198】
- **Panel de auditoría**: componente lateral que recibe datos `createdBy`, `updatedAt`, `accessId` y los muestra en formato legible, usado en módulos sensibles (Costos, Importaciones, Asientos).【F:src/modules/existencias/services/existencias.service.ts†L45-L137】【F:src/modules/existencias/services/asiento-control.service.ts†L1-L22】
- **Selector avanzado de filtros**: persistir filtros en local storage y sincronizar con query string para permitir deep-linking, especialmente en Reportes y Consumos.【F:src/modules/reportes/services/reports.service.ts†L28-L155】【F:src/modules/consumo/controllers/consumo.controller.ts†L25-L55】

## Detalle por módulo

### Catálogos y configuración

- **Actividades**
  - *UI recomendada*: listado con filtro por nombre, modal de alta/edición y confirmación de baja.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/actividades`, `GET /api/actividades/:id`.【F:src/modules/actividad/routes/actividad.routes.ts†L9-L13】
  - *Notas*: los números correlativos (`nroAct`) se calculan en backend, por lo que el formulario solo necesita `nombre`.

- **Empleados**
  - *UI recomendada*: tabla ordenable, formulario simple y acciones de edición/baja.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/empleados`, `GET /api/empleados/:id`.【F:src/modules/empleado/routes/empleado.routes.ts†L9-L13】
  - *Notas*: tras crear un empleado el backend retorna `Nroem` autoincremental que debe mostrarse en la UI.

- **Centros de producción**
  - *UI recomendada*: tabla paginada, modal de alta, drawer de edición, confirmación de baja.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/centros-produccion`, `GET /api/centros-produccion/:id`.【F:src/modules/centro-produccion/routes/centro-produccion.routes.ts†L12-L16】
  - *Notas*: validar que `nroCentro` sea entero positivo antes de enviar.

- **Centros de apoyo**
  - *UI recomendada*: tabla de centros y pestaña adicional con gastos filtrables por fecha.
  - *Endpoints*: `GET /api/centros-apoyo`, `GET /api/centros-apoyo/:id`, `PUT /api/centros-apoyo/:id`, `GET /api/centros-apoyo/gastos`.【F:src/modules/centro-apoyo/routes/centro-apoyo.routes.ts†L10-L13】
  - *Notas*: la vista de gastos debe permitir construir query string con `fechaCalculo` y `esGastoDelPeriodo`.

- **Catálogos (insumos, listas de precio, maquinarias)**
  - *UI recomendada*: tabs para cada catálogo, formularios reutilizables y sección de sincronización masiva.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/catalogos/insumos`, `/api/catalogos/lista-precio`, `/api/catalogos/maquinarias` más rutas `/sync` para cargas masivas.【F:src/modules/catalogos/controller.ts†L20-L58】
  - *Notas*: las operaciones `/sync` esperan un arreglo JSON y responden con los registros procesados; mostrar resumen de resultados.

- **Fecha de cálculo**
  - *UI recomendada*: widget persistente en el header con modal para actualizar fecha y responsable.
  - *Endpoints*: `GET /api/fecha-calculo`, `POST /api/fecha-calculo`.【F:src/modules/fecha-calculo/routes/fecha-calculo.routes.ts†L9-L10】
  - *Notas*: cada cambio debe invalidar caches y actualizar el contexto compartido.

### Operación diaria

- **Consumos**
  - *UI recomendada*: filtros por producto y fechas, tabla con totales y modal de carga/edición.
  - *Endpoints*: `POST /api/consumos`, `GET /api/consumos`, `PUT /api/consumos/:id`, `DELETE /api/consumos/:id`.【F:src/modules/consumo/routes/consumo.routes.ts†L16-L27】
  - *Notas*: el backend valida esquemas Zod; mostrar errores específicos cuando la request sea rechazada.

- **Producciones**
  - *UI recomendada*: filtros por centro/etapa, tabla con cantidades y tarjetas de totales.
  - *Endpoints*: `POST /api/producciones`, `GET /api/producciones`, `PUT /api/producciones/:id`, `DELETE /api/producciones/:id`.【F:src/modules/produccion/routes/produccion.routes.ts†L16-L27】
  - *Notas*: usar el mismo componente maestro-detalle que consumos para mantener consistencia.

- **Producción de crema**
  - *UI recomendada*: panel para reprocesar lotes desde Access, tabla principal y modal de edición rápida.
  - *Endpoints*: `POST /api/prodcrema`, `GET /api/prodcrema`, `PUT /api/prodcrema/:id`, `DELETE /api/prodcrema/:id`.【F:src/modules/prodcrema/routes/prodcrema.routes.ts†L7-L10】
  - *Notas*: los lotes se cargan en bloque, por lo que conviene mostrar vista previa antes de confirmar.

- **Litros de crema**
  - *UI recomendada*: filtros por fecha y producto, tabla con badge de registros importados, modal de edición.
  - *Endpoints*: `POST /api/litros-crema`, `GET /api/litros-crema`, `PUT /api/litros-crema/:id`, `DELETE /api/litros-crema/:id`.【F:src/modules/litroscrema/routes/litroscrema.routes.ts†L7-L15】
  - *Notas*: la acción de reproceso exige fecha obligatoria.

- **Pérdidas**
  - *UI recomendada*: filtros por rango y producto, tabla con indicadores de hormas/kg, modal de edición.
  - *Endpoints*: `GET/POST /api/perdidas`, `GET/PUT/DELETE /api/perdidas/:id`.【F:src/modules/perdida/routes/perdida.routes.ts†L11-L20】
  - *Notas*: validar IDs de Mongo antes de ejecutar acciones destructivas.

- **Sobrantes**
  - *UI recomendada*: similar a pérdidas, con validaciones de fecha y badges para cálculos.
  - *Endpoints*: `POST /api/sobrantes`, `GET /api/sobrantes`, `PUT /api/sobrantes/:id`, `DELETE /api/sobrantes/:id`.【F:src/modules/sobrante/routes/sobrante.routes.ts†L9-L35】
  - *Notas*: el backend usa `express-validator`; mostrar mensajes devueltos en el cuerpo de error.

### Asignaciones y distribución

- **Asignación actividad-empleado**
  - *UI recomendada*: tabla maestro-detalle con panel lateral para actividades por empleado.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/asignacion-actividad-empleado`, `GET /api/asignacion-actividad-empleado/:id`.【F:src/modules/asignacion-actividad-empleado/routes/asignacion-actividad-empleado.routes.ts†L12-L16】
  - *Notas*: validar porcentajes totales antes de guardar para evitar mensajes 400.

- **Asignación de centros**
  - *UI recomendada*: tabla con resumen de porcentajes y modal maestro-detalle para configurar destinos.
  - *Endpoints*: `GET/POST/PUT/DELETE /api/asignacion-centro`, `GET /api/asignacion-centro/:id`.【F:src/modules/asignacion-centro/routes/asignacion-centro.routes.ts†L12-L25】
  - *Notas*: si se habilitan porcentajes, mostrar validaciones cuando la suma supere 100 %.

- **Historial de asignaciones**
  - *UI recomendada*: timeline por fecha con tabla de pasos por centro.
  - *Endpoints*: `GET /api/asignaciones/historial/:centro`.【F:src/modules/asignacion-historial/routes/asignacion-historial.routes.ts†L6-L7】
  - *Notas*: cargar catálogo de centros en memoria para traducir IDs a nombres legibles.

- **Distribución de centro de apoyo**
  - *UI recomendada*: vista de sólo lectura con tabla de prorrateos vigentes.
  - *Endpoints*: `GET /api/centros-apoyo/distribucion`.【F:src/modules/centros/routes/distribucion-centro-apoyo.routes.ts†L6-L7】
  - *Notas*: combinar esta vista con filtros de fecha si se amplía el backend.

- **Costos finales por SKU**
  - *UI recomendada*: búsqueda por SKU con tarjeta de resultados.
  - *Endpoints*: `GET /api/costos-finales/:sku`.【F:src/modules/centros/routes/costos-finales.routes.ts†L6-L7】
  - *Notas*: se integra como herramienta de consulta desde reportes o existencias.

### Costos y consolidaciones

- **Costos**
  - *UI recomendada*: tabs para gastos, depreciaciones, sueldos y un panel de prorrateo automático que solo muestra resultados y balances.
  - *Endpoints*: `/api/costos/gasto-centro`, `/api/costos/depreciacion`, `/api/costos/sueldo` (GET/POST/PUT/DELETE). El prorrateo se calcula en background mediante `CostosSyncService`, por lo que la UI consulta únicamente los balances devueltos por estos endpoints.【F:src/modules/costos/routes/costos.routes.ts†L19-L73】【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】
  - *Notas*: enviar header `x-user` en PUT/DELETE para registrar auditoría y mostrar la fecha del último prorrateo automático.

- **CIF**
  - *UI recomendada*: pestañas para CIF total, CIF unitario y botón destacado para recalcular.
  - *Endpoints*: `POST /api/cif/total`, `POST /api/cif/unitario`, `GET /api/cif/total/:producto`, `GET /api/cif/unitario/:producto`, `POST /api/cif/recalcular`.【F:src/modules/cif/routes/cif.routes.ts†L7-L11】
  - *Notas*: mostrar advertencias cuando el backend devuelva errores `CIF_TOTAL_NOT_FOUND` o `CANTIDAD_MAYOR_CERO`.

- **Existencias y asientos**
  - *UI recomendada*: dashboard con tabla consolidada, tarjeta de debitos/créditos y botón “Consolidar período”.
  - *Endpoints*: `GET /api/existencias`, `POST /api/existencias`, `POST /api/existencias/consolidar`, `GET /api/asientos-control`, `POST /api/asientos-control`.【F:src/modules/existencias/routes/existencias.routes.ts†L7-L10】【F:src/modules/existencias/routes/asiento-control.routes.ts†L7-L8】
  - *Notas*: tras consolidar, refrescar también la vista de asientos y mostrar backups generados automáticamente.【F:src/modules/existencias/services/existencias.service.ts†L45-L137】

- **Asignaciones manuales y costos finales**
  - *UI recomendada*: formulario para cargar ajustes manuales y tabla de resultados.
  - *Endpoints*: `POST /api/asignaciones-manuales`, `GET /api/asignaciones-finales`.【F:src/modules/centros-asignaciones/routes/centros-asignaciones.routes.ts†L9-L10】
  - *Notas*: usar esta vista para complementar asignaciones automáticas previas.

- **Importación MDB**
  - *UI recomendada*: asistente de carga con barra de progreso y historial de ejecuciones.
  - *Endpoints*: `POST /import` para subir el archivo, `GET /api/importaciones`, `GET /api/importaciones/:id`, `POST /api/importaciones`, `PUT /api/importaciones/:id`, `DELETE /api/importaciones/:id`.【F:src/modules/importaciones/routes/importaciones.routes.ts†L17-L41】
  - *Notas*: mostrar logs por tabla usando los campos `table`, `collection`, `inserted` y `error` que retorna el backend.

### Analítica y reportes

- **Reportes**
  - *UI recomendada*: tabs o menú lateral con componentes reutilizables de filtros y resultados (tablas, gráficos, tarjetas).
  - *Endpoints*: `GET /api/reportes/cif`, `/api/reportes/consumos`, `/api/reportes/asignaciones`, `/api/reportes/cuadros`, `/api/reportes/costos`, `/api/reportes/comparativo`, `/api/reportes/mano-obra`.【F:src/modules/reportes/routes/reportes.routes.ts†L7-L13】
  - *Notas*: permitir exportar datos agregando el query param `format` y mostrar indicadores de consistencia (`consistente`, `diferencia`).【F:src/modules/reportes/services/reports.service.ts†L28-L104】

## Flujo operativo sugerido por período

1. **Configurar fecha de cálculo** desde el widget global para asegurar que todos los módulos trabajen sobre el mismo contexto.【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L12-L93】
2. **Actualizar catálogos** (empleados, centros, actividades, insumos) antes de iniciar la carga operativa para evitar referencias faltantes.【F:src/modules/catalogos/controller.ts†L20-L58】
3. **Registrar operaciones diarias** en el siguiente orden sugerido para maximizar coherencia: Producciones → Consumos → Pérdidas/Sobrantes → Litros/Producción de crema. Cada guardado debe disparar un refresco en Existencias mediante invalidación de caché.【F:src/modules/existencias/services/existencias.service.ts†L45-L137】
4. **Cargar costos** (gastos, depreciaciones, sueldos) y monitorear el prorrateo automático generado tras cada importación o sincronización. Mostrar banners cuando existan `warning` o desbalances devueltos por la API y registrar la fecha del último cálculo.【F:src/modules/costos/controllers/costos.controller.ts†L56-L219】【F:src/modules/costos/services/costos-sync.service.ts†L1-L143】
5. **Registrar asignaciones** (actividad-empleado y centros). Use los totales de horas y porcentajes para validar que el 100 % esté cubierto antes de continuar con cierres.【F:src/modules/asignacion-actividad-empleado/entities/asignacion-actividad-empleado.model.ts†L6-L64】【F:src/modules/asignacion-centro/entities/asignacion-centro.model.ts†L5-L31】
6. **Ejecutar consolidaciones**: consolidar existencias, crear asientos de control y recalcular CIF si corresponde. Resalte en UI los cambios resultantes y ofrezca accesos directos a los reportes relacionados.【F:src/modules/existencias/controllers/asiento-control.controller.ts†L1-L20】【F:src/modules/cif/services/cif.service.ts†L87-L133】
7. **Generar reportes y validar consistencia**: ejecutar reportes comparativos y de costos finales para confirmar que `totalEgresos` y `totalInsumos` coinciden antes de cerrar el período.【F:src/modules/reportes/services/reports.service.ts†L59-L104】
8. **Registrar ajustes manuales** si detecta diferencias, utilizando el módulo de centros-asignaciones y actualizando posteriormente los reportes para confirmar el equilibrio.【F:src/modules/centros-asignaciones/controllers/centros-asignaciones.controller.ts†L31-L63】

## Dependencias clave entre módulos

- **Existencias** consolida movimientos provenientes de producción, ventas, pérdidas y sobrantes, calculando débitos y créditos para el asiento de control. Actualizar esta vista cada vez que cambie alguno de los módulos fuente.【F:src/modules/existencias/services/existencias.service.ts†L45-L113】【F:src/modules/existencias/services/movimientos.service.ts†L15-L95】
- **CIF** depende del costo final por producto y de la producción registrada en el período para calcular base y costo unitario. Si no hay datos suficientes, el backend devuelve montos en cero o errores específicos.【F:src/modules/cif/services/cif.service.ts†L107-L146】
- **Reportes** combinan agregaciones de costos, consumos, asignaciones y mano de obra; cualquier actualización en esos módulos debe invalidar la caché de reportes para mantener coherencia.【F:src/modules/reportes/services/reports.service.ts†L28-L155】
- **Fecha de cálculo** impacta operaciones que dependen de periodos (costos, existencias, importaciones). Cambiarla debe disparar un refresco global del estado para evitar mezclar períodos.【F:src/modules/fecha-calculo/services/CalculationDateService.ts†L12-L93】

## Buenas prácticas de UI/UX transversales

1. **Persistencia de filtros**: guarde en almacenamiento local los filtros utilizados con mayor frecuencia (producto, centro, periodo) para precargar vistas al regresar.
2. **Mensajes consistentes**: utilice un sistema de notificaciones unificado que muestre los mensajes `{ "message": "..." }` retornados por la API para evitar interpretaciones erróneas.【F:src/common/middlewares/error-handler.ts†L3-L16】
3. **Contexto de usuario**: siempre que un endpoint requiera `x-user`, muestre quién realizó la última acción en los listados para reforzar la trazabilidad.
4. **Sincronizaciones automáticas**: informe cuando existan procesos en background (sincronización de costos o catálogos) para que el usuario entienda por qué los datos cambian sin intervención directa.【F:src/index.ts†L47-L126】
5. **Accesibilidad**: cada tabla debe ofrecer atajos de teclado para navegación (ej. `Alt+N` para “nuevo”, `Alt+F` para “filtrar”) y cumplir contraste AA, especialmente en vistas densas de datos.

Con este blueprint podrá construir un frontend coherente, modular y alineado con los contratos REST existentes.
