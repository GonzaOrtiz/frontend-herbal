# Módulo de Catálogos

Incluye tres catálogos principales: **Insumos**, **Listas de precio** y **Maquinarias**. Todos comparten campos base (`codigo`, `descripcion`, `activo`, `modificadoManualmente`) y se gestionan mediante un controlador genérico que valida datos obligatorios y registra al usuario responsable en actualizaciones y bajas.【F:src/modules/catalogos/baseModel.ts†L4-L33】【F:src/modules/catalogos/controllers/catalog.controller.ts†L12-L70】

## Diseño general
1. **Menú lateral** con pestañas o subrutas para cada catálogo.
2. **Listado con filtros** persistentes por estado (`activo`), texto libre (código/descripción) y campos específicos.
3. **Formulario modal o drawer** reutilizable con componentes condicionados por el tipo de catálogo seleccionado.
4. **Panel de auditoría** mostrando `modificadoManualmente`, usuario (`x-user`) y fecha de última modificación si viene del backend.
5. **Acción de sincronización masiva** visible solo para perfiles autorizados, con barra de progreso y resumen de resultados.

## Comportamientos comunes
- Validar que `codigo` y `descripcion` estén presentes antes de habilitar el guardado; el backend responde 400 cuando faltan.【F:src/modules/catalogos/controllers/catalog.controller.ts†L25-L55】
- Enviar cabecera `x-user` en operaciones PUT/DELETE para registrar trazabilidad.
- Mostrar badges de estado “Activo/Inactivo” en las tablas.
- Implementar paginación en frontend con opción de ajustar tamaño de página.
- Mostrar mensajes claros para errores 404 (`Registro no encontrado`) y 400 (`El cuerpo debe ser un arreglo`) en sincronización.

## Catálogo de Insumos
### Campos específicos
`fechaIn`, `articulo`, `cantidad`, `monto`, `usado`, `accessId` opcional.【F:src/modules/catalogos/entities/insumo.model.ts†L5-L41】

### Formulario sugerido
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `codigo` | Texto | Requerido, mayúsculas, sin espacios iniciales | Autogenerar propuesta a partir del artículo si aplica |
| `descripcion` | Texto multilinea | Requerido | Mostrar contador de caracteres |
| `fechaIn` | Selector de fecha | Requerido | Convertir a ISO al enviar |
| `articulo` | Texto | Requerido | Puede vincularse a catálogo de productos |
| `cantidad` | Número decimal | Requerido, >=0 | Mostrar unidad asociada |
| `monto` | Número decimal | Requerido, >=0 | Formato monetario |
| `usado` | Switch booleano | Opcional | Preseleccionar según estado |
| `activo` | Switch | Requerido | True por defecto |

### UX
- Agrupar insumos por fecha y permitir ordenar por monto.
- Al cambiar `usado`, destacar fila con ícono.

## Catálogo de Listas de Precio
### Campos específicos
`nroLista`, `nombreLista`, `fechaLista`, `tipoProd`, `producto`, `precioUnit`, `costoUnit`, `margen`, `litrosLeche`, `ganPorLitro`, `marCosto`, `comision`, `flete`, `marNetCom`, `ganLeche`, `accessId` opcional.【F:src/modules/catalogos/entities/lista-precio.model.ts†L5-L68】

### Formulario sugerido
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `nroLista` | Número entero | Requerido, único | Mostrar alerta si ya existe |
| `nombreLista` | Texto | Requerido | Capitalizar automáticamente |
| `fechaLista` | Selector de fecha | Requerido | Validar no futura |
| `tipoProd` | Dropdown | Requerido | Opciones predefinidas |
| `producto` | Autocompletar | Requerido | Vincular a catálogo de productos |
| `precioUnit` | Número decimal | Requerido, >=0 | Permitir dos decimales |
| `costoUnit` | Número decimal | Requerido, >=0 | Calcular margen |
| Campos adicionales | Número decimal | Opcionales, >=0 | Mostrar ayuda contextual |
| `activo` | Switch | Requerido | Determina si se muestra en listados comerciales |

### UX
- Calcular `margen` dinámicamente (`(precioUnit - costoUnit) / precioUnit`) y permitir al usuario confirmar o editar.
- Mostrar vista previa del precio con impuestos si aplica.

## Catálogo de Maquinarias
### Campos específicos
`nCentro`, `maqui`, `fechaDem`, `horasDisp`, `capacidad`, `accessId` opcional.【F:src/modules/catalogos/entities/maquinaria.model.ts†L5-L36】

### Formulario sugerido
| Campo | Tipo | Validaciones | Comentarios |
| --- | --- | --- | --- |
| `nCentro` | Autocompletar centros | Requerido | Mostrar nombre y código |
| `maqui` | Texto | Requerido | Código interno de maquinaria |
| `fechaDem` | Selector de fecha | Requerido | Fecha de depreciación |
| `horasDisp` | Número decimal | Opcional, >=0 | Horas disponibles |
| `capacidad` | Número decimal | Opcional, >=0 | Mostrar unidad (litros, kg) |
| `activo` | Switch | Requerido | |

### UX
- Permitir filtrar por centro y agrupar por estado activo.
- Mostrar indicadores de utilización basados en `horasDisp`.

## Sincronización masiva
- Mostrar área para pegar JSON o subir archivo (CSV/Excel convertido a JSON).
- Validar que el payload sea arreglo antes de enviar; la API retorna 400 si no lo es.【F:src/modules/catalogos/controllers/catalog.controller.ts†L57-L64】
- Mostrar resumen de resultados (insertados, actualizados, errores) basado en respuesta del backend.

## Endpoints por submódulo
| Submódulo | Método | Endpoint | Uso | Notas |
| --- | --- | --- | --- | --- |
| Insumos | GET | `/api/catalogos/insumos` | Listar registros | Permitir filtros por `activo` y `usado` |
|  | POST | `/api/catalogos/insumos` | Crear registro | Validar campos base antes de enviar |
|  | GET | `/api/catalogos/insumos/{id}` | Obtener detalle | Manejar 404 |
|  | PUT | `/api/catalogos/insumos/{id}` | Actualizar | Enviar `x-user` y datos modificados |
|  | DELETE | `/api/catalogos/insumos/{id}` | Eliminar | Confirmar con usuario y enviar `x-user` |
|  | POST | `/api/catalogos/insumos/sync` | Sincronizar masivamente | Payload arreglo de insumos |
| Listas de precio | GET | `/api/catalogos/lista-precio` | Listado | Permitir paginación |
|  | POST | `/api/catalogos/lista-precio` | Alta | Validar `nroLista` único |
|  | GET | `/api/catalogos/lista-precio/{id}` | Detalle | — |
|  | PUT | `/api/catalogos/lista-precio/{id}` | Actualización | Enviar `x-user` |
|  | DELETE | `/api/catalogos/lista-precio/{id}` | Eliminación | Mostrar mensaje de éxito |
|  | POST | `/api/catalogos/lista-precio/sync` | Sincronización | Validar arreglo |
| Maquinarias | GET | `/api/catalogos/maquinarias` | Listado | Filtro por `nCentro` |
|  | POST | `/api/catalogos/maquinarias` | Alta | Validar fecha |
|  | GET | `/api/catalogos/maquinarias/{id}` | Detalle | — |
|  | PUT | `/api/catalogos/maquinarias/{id}` | Actualización | Enviar `x-user` |
|  | DELETE | `/api/catalogos/maquinarias/{id}` | Eliminación | Confirmar |
|  | POST | `/api/catalogos/maquinarias/sync` | Sincronización | Validar arreglo |

### Ejemplo de request/respuesta (sincronización de insumos)
```http
POST /api/catalogos/insumos/sync
Content-Type: application/json
x-user: asandoval

[
  {
    "codigo": "INS-001",
    "descripcion": "Concentrado de leche premium",
    "fechaIn": "2024-05-01",
    "articulo": "LECHE-PREM",
    "cantidad": 1200,
    "monto": 9800.5,
    "usado": true,
    "activo": true,
    "accessId": "INSUMO-2024-05-01"
  }
]
```
```json
{
  "processed": 1,
  "inserted": 1,
  "updated": 0,
  "errors": []
}
```

### Experiencia de usuario general
- Mostrar íconos diferenciados por catálogo para facilitar identificación visual.
- Implementar historial de cambios con tooltip mostrando usuario (`x-user`) y fecha devuelta por backend cuando esté disponible.
- Permitir duplicar registros como base para nuevos ítems (se crea modal con datos copiados).
