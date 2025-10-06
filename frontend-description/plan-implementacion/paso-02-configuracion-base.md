# Paso 2. Configuración técnica inicial

**Objetivo:** Dejar lista la base técnica del proyecto para iniciar el desarrollo con las herramientas definidas.

## Actividades principales
- Inicializar proyecto con Vite + React + TypeScript y configurar alias de importación.
- Instalar Material UI (MUI Core y MUI X si se usarán tablas avanzadas) y crear el tema central.
- Configurar TanStack Query, Zustand/Redux Toolkit y Axios con interceptores de autenticación (`Authorization`, `x-user`).
- Integrar ESLint, Prettier, Stylelint, Husky y commitlint conforme a la guía de `frontend-description/README.md`.
- Definir variables de entorno (`VITE_API_URL`, `VITE_DEFAULT_CALCULATION_DATE`, `VITE_VERSION`).

## Entregables
- Repositorio inicial con pipeline de linting y formateo automático.
- Tema de Material UI aplicado globalmente (colores, tipografía, componentes base).
- Instancias de Axios y proveedores de estado configurados.

## Criterios de aceptación
- Comandos `npm run lint` y `npm run test` configurados aunque las pruebas aún no existan.
- Se puede hacer render del `App` con el tema de Material UI y providers de React Query y store global.
- Las variables de entorno cuentan con ejemplos documentados (`.env.example`).
