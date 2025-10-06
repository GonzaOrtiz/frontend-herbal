# Paso 4. Módulos de configuración y catálogos

**Objetivo:** Implementar los módulos base que alimentan catálogos y parámetros esenciales para el resto del sistema.

## Actividades principales
- Desarrollar vistas CRUD para Actividades, Empleados, Centros de producción y apoyo, y Fecha de cálculo.
- Construir formularios reutilizables con validaciones de Material UI y manejo de errores centralizado.
- Implementar tablas paginadas con filtros persistentes usando componentes de MUI Data Grid o Table.
- Configurar sincronizaciones y banners informativos para catálogos según `catalogos.md`.
- Agregar pruebas unitarias de hooks y componentes clave.

## Entregables
- Rutas de Configuración operativas con datos provenientes de los endpoints reales.
- Componentes de formulario y tabla reutilizables documentados.
- Hooks de datos (`useActividades`, `useEmpleados`, etc.) con estados `loading` y `error` gestionados.

## Criterios de aceptación
- Operaciones CRUD muestran toasts y estados deshabilitados durante requests.
- Los catálogos se almacenan en cache y se invalidan tras mutaciones.
- Existe documentación breve de componentes compartidos en Storybook o MDX.
