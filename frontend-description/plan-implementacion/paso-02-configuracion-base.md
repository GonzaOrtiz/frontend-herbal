# Paso 2. Configuración técnica inicial

**Objetivo:** Dejar lista la base técnica del proyecto para iniciar el desarrollo con las herramientas definidas.

## Artefactos de referencia

- Stack recomendado: [`frontend-description/frontend-architecture.md`](../frontend-architecture.md).
- Reglas de estilo y tooling: [`frontend-description/README.md`](../README.md).
- Detalle de endpoints y contratos: [`frontend-description/api-reference.md`](../api-reference.md).
- Convenciones de despliegue y variables: [`frontend-description/deployment.md`](../deployment.md).

## Checklist operativo

1. **Bootstrap del repositorio**
   - Crear proyecto con Vite (`npm create vite@latest`) seleccionando plantilla React + TypeScript.
   - Configurar alias en `tsconfig.json` y `vite.config.ts` para `@/` apuntando a `src/` según la arquitectura.
   - Agregar carpeta `src/modules` alineada al listado de dominios del `system-overview`.

2. **Dependencias fundamentales**
   - Instalar Material UI (`@mui/material`, `@mui/icons-material`, `@mui/lab`) y, si se usarán tablas avanzadas, `@mui/x-data-grid`.
   - Instalar herramientas de estado y datos: `@tanstack/react-query`, `@tanstack/react-query-devtools`, `zustand` (o Redux Toolkit) y `axios`.
   - Añadir librerías utilitarias recurrentes: `react-hook-form`, `zod` para validaciones y `date-fns` para manejo de fechas.

3. **Tema y providers globales**
   - Construir archivo `src/theme/index.ts` con el tema Material UI basado en los tokens acordados en el Paso 1.
   - Crear `src/app/providers/AppProviders.tsx` que combine `ThemeProvider`, `CssBaseline`, `QueryClientProvider`, `ReactQueryDevtools` y el store global.
   - Configurar internacionalización si aplica (`dayjs` locales, `@formatjs`), asegurando la fecha de cálculo como variable global.

4. **Clientes HTTP y manejo de errores**
   - Crear `src/lib/http/apiClient.ts` con instancias de Axios, interceptores de autenticación (`Authorization`, `x-user`) y manejo de refresh tokens según `api-reference`.
   - Definir tipado de respuestas base (`ApiResponse<T>`, `PaginatedResponse<T>`) acorde a contratos documentados.
   - Preparar estrategia de logging de errores (por ejemplo, `Sentry`) en `src/lib/observability`.

5. **Quality gates y automatización**
   - Integrar ESLint, Prettier y Stylelint con las reglas propuestas en `frontend-description/README.md`.
   - Configurar Husky + lint-staged + commitlint con hooks de pre-commit y commit-msg.
   - Añadir scripts `npm run lint`, `npm run typecheck`, `npm run test` (con Vitest/Jest) y `npm run format`.

6. **Variables y documentación**
   - Crear `.env.example` con `VITE_API_URL`, `VITE_DEFAULT_CALCULATION_DATE`, `VITE_VERSION`, `VITE_SENTRY_DSN`.
   - Documentar en `README` del proyecto cómo ejecutar `npm install`, `npm run dev`, `npm run lint`.
   - Configurar pipeline inicial (GitHub Actions o GitLab CI) con pasos de instalación, lint y typecheck.

## Entregables

- Repositorio inicial con pipeline de linting, typecheck y formateo automático ejecutándose en CI.
- Tema de Material UI aplicado globalmente y providers configurados para Query/estado global.
- Cliente HTTP centralizado con interceptores y tipado básico documentado.

## Criterios de aceptación

- Comandos `npm run lint`, `npm run typecheck` y `npm run test` se ejecutan sin errores, aunque las pruebas aún no existan.
- El componente raíz `<App />` renderiza con el tema aplicado y providers activos sin warnings en consola.
- Las variables de entorno cuentan con ejemplos documentados (`.env.example`) y se validan en tiempo de build.
