# Módulo Historial de Asignaciones

## Propósito
Auditar los pasos de prorrateo realizados sobre un centro determinado, mostrando cómo se distribuyeron porcentajes y montos entre centros origen y destino en cada ejecución registrada. Los registros almacenan el centro analizado, la fecha del cálculo y los pasos ejecutados con referencias a centros relacionados.【F:src/modules/asignacion-historial/entities/asignacion-historial.model.ts†L5-L35】

## Diseño de interfaz sugerido
- **Selector principal de centro**: autocompletar que obtenga datos de `/api/centros-produccion`, mostrando código y descripción.
- **Timeline o lista cronológica**: cada item representa una fecha (`fecha`) con resumen de totales (monto total distribuido, cantidad de pasos).
- **Panel de detalle expandible**:
  - Tabla secundaria con columnas `desde`, `hacia`, `porcentaje`, `monto`, `montoAcumulado` (calculado en frontend) y badge cuando exista variación de porcentaje respecto al periodo anterior.
  - Mostrar nombres de centros: el servicio popula referencias `pasos.desde` y `pasos.hacia`, pero conviene normalizar los datos en el cliente para cachear `nroCentro` y `nombre` y evitar renders repetidos.【F:src/modules/asignacion-historial/services/asignacion-historial.service.ts†L1-L5】
- **Controles complementarios**:
  - Botón “Exportar” a CSV/Excel.
  - Filtros rápidos por rango de fechas.
  - Indicadores visuales cuando el prorrateo no suma 100 %.

## Flujo de usuario
1. Al abrir la vista, solicitar al usuario que seleccione un centro. Evitar llamadas a la API sin filtro.
2. Al elegir un centro, ejecutar `GET /api/asignaciones/historial/{centro}`. Mostrar loader y manejar estados vacíos con mensaje “Sin historial para este centro”.【F:src/modules/asignacion-historial/controllers/asignacion-historial.controller.ts†L7-L12】
3. Ordenar los resultados por `fecha` descendente (el backend no aplica `sort`, por lo que debe hacerse en el cliente). Calcular diferencias respecto al registro anterior para resaltar cambios significativos.
4. Permitir expandir cada item para ver los pasos. Mostrar totales calculados (`Σ monto`, `Σ porcentaje`) y resaltar en rojo cuando el porcentaje acumulado difiera de 100 %. Guardar este resumen para exportaciones.
5. Habilitar exportación del conjunto filtrado respetando el orden visual y los totales calculados en frontend.

## Integración con API REST
| Método | Endpoint | Parámetros | Respuesta | Consideraciones |
| --- | --- | --- | --- | --- |
| GET | `/api/asignaciones/historial/{centro}` | `centro`: ObjectId del centro seleccionado | `[{ _id, centro, fecha, pasos: [{ desde, hacia, porcentaje, monto }] }]` (con `desde`/`hacia` populados con los campos del centro) | No requiere autenticación adicional; manejar respuestas vacías |

### Ejemplo de respuesta
```json
[
  {
    "_id": "665acf52b5fb32d21b4f01c0",
    "centro": "64fdc81c2f5a6b8d1a9a1c20",
    "fecha": "2024-05-31T00:00:00.000Z",
    "pasos": [
      { "desde": 101, "hacia": 301, "porcentaje": 60, "monto": 7500.45 },
      { "desde": 101, "hacia": 302, "porcentaje": 40, "monto": 5000.3 }
    ]
  }
]
```

### Buenas prácticas UX
- Mostrar nombres legibles de centros obtenidos desde el catálogo para evitar identificadores crudos.
- Ofrecer tooltips con detalles adicionales (por ejemplo, costo base usado en el cálculo).
- Incluir alertas si alguna fila tiene porcentaje > 100 % o valores negativos, para que el usuario contacte a soporte.
