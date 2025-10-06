# Guía de arranque técnico del frontend

Este documento establece la línea base para iniciar la implementación del frontend de Herbal. Complementa el blueprint funcional y las guías UI/UX existentes, añadiendo acuerdos sobre stack, convenciones de código, flujos de trabajo y calidad para asegurar un desarrollo homogéneo.

## Stack recomendado

| Capa | Herramientas | Notas |
| --- | --- | --- |
| Construcción | [Vite](https://vitejs.dev/) + TypeScript 5 | Arranque rápido, HMR nativo y soporte para `vitest`.
| Framework | React 18 + React Router 6.22 | Navegación declarativa acorde a la estructura descrita en `frontend-architecture.md`.【F:frontend-description/frontend-architecture.md†L8-L52】
| Estado remoto | TanStack Query 5 | Capa para fetching/cache; cada módulo expone hooks (`useCostosList`, `useSyncStatus`).【F:frontend-description/frontend-architecture.md†L59-L88】
| Estado global | Zustand (o Redux Toolkit si se prefiere más tooling) | Manejo de autenticación, fecha de cálculo y preferencias persistentes.【F:frontend-description/frontend-architecture.md†L91-L110】
| HTTP | Axios + interceptores | Centralizar token y cabecera `x-user` exigida por los endpoints sensibles.【F:frontend-description/frontend-architecture.md†L118-L134】
| Estilos | CSS Modules + tokens en `theme/` o, alternativamente, Tailwind con preset corporativo | Mantener consistencia con `ui-ux-guidelines.md` y facilitar tree-shaking.
| Componentes | Storybook 8, Testing Library, MSW | Documentar variantes de tablas, formularios y banners críticos.【F:frontend-description/frontend-architecture.md†L142-L148】
| Tests | Vitest (unitario/integración) + Cypress (E2E) | Ejecutar en CI como parte de la pipeline.【F:frontend-description/frontend-architecture.md†L134-L140】

## Principios de diseño e implementación

1. **Dominio primero**: la organización de módulos, rutas y componentes debe seguir el blueprint funcional y los dominios descritos en `system-overview.md`.【F:frontend-description/system-overview.md†L1-L75】
2. **Composición sobre herencia**: favorecer componentes pequeños reutilizables (`shared/`) y ensamblarlos en vistas (`modules/*/pages`).
3. **Contratos explícitos**: cada hook o servicio expone tipos generados a partir de los DTOs de backend; usar Zod para validaciones de entrada.
4. **Sincronización centralizada**: cualquier cambio en fecha de cálculo o importaciones debe invalidar caches y disparar eventos globales tal como se indica en la arquitectura.【F:frontend-description/frontend-architecture.md†L33-L88】【F:frontend-description/frontend-architecture.md†L118-L143】
5. **Accesibilidad y rendimiento**: seguir los lineamientos UI/UX para accesibilidad AA, filtros persistentes y virtualización de tablas densas.【F:frontend-description/ui-ux-guidelines.md†L1-L75】【F:frontend-description/ui-ux-guidelines.md†L91-L125】

## Estructura de carpetas

```
src/
├─ app/                # Bootstrap de React, providers globales, router
├─ modules/
│  ├─ costos/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  └─ pages/
│  └─ ...              # Un módulo por dominio funcional
├─ shared/
│  ├─ components/      # Tablas, formularios base, toasts, breadcrumbs
│  ├─ hooks/           # useAuth, useCalculationDate, useMediaQuery
│  ├─ layouts/         # AppShell, DashboardLayout, DetailLayout
│  ├─ stores/          # slices Zustand globales
│  └─ utils/           # formateadores, helpers de fecha/moneda
├─ theme/              # design tokens, mixins, tipografía
└─ tests/              # mocks, MSW handlers, factories
```

Mantener independencia entre dominios y compartir únicamente desde `shared/`, según lo establecido previamente.【F:frontend-description/frontend-architecture.md†L88-L113】 Documentar cada módulo con un README que vincule a la documentación funcional correspondiente.

## Convenciones de código

- **Naming**: archivos React en `PascalCase` (`CostosTable.tsx`), hooks en `camelCase` (`useCostosFilters.ts`), stores en `*.store.ts`.
- **Componentes**: preferir componentes funcionales con hooks; separar lógica de presentación (`Component.tsx`) de hooks (`useComponent.ts`).
- **Imports**: usar paths absolutos configurados en `tsconfig.json` (`@/shared/components/Table`).
- **Tipado**: todo endpoint debe tener tipos `Request`/`Response` explícitos; generar clientes con `axios` tipado o `openapi-typescript` cuando esté disponible.
- **Estilos**: mantener design tokens en `theme/` y consumirlos a través de helpers (`useThemeToken`). Evitar estilos ad-hoc.
- **Internacionalización**: centralizar textos en un diccionario simple (`shared/i18n/`). Etiquetas deben incluir placeholders (`{fecha}`) y respetar formato de números/monedas en español.

## Flujos de trabajo

1. **Branching**: usar convención `feature/<dominio>-<resumen>`, `fix/...`, `chore/...`.
2. **Commits**: formato [Conventional Commits](https://www.conventionalcommits.org/) para automatizar changelog y versionado.
3. **Pull Requests**:
   - Checklist: lint, pruebas unitarias, pruebas afectadas manuales (según módulo).
   - Describir impacto UI y adjuntar capturas cuando aplique.
   - Enlazar documentación del módulo (`frontend-description/<modulo>.md`).
4. **Revisiones**: mínimo 1 reviewer del dominio y 1 del chapter frontend para validar lineamientos comunes.
5. **CI/CD**: pipeline ejecuta `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e` (si aplica) antes de generar artefactos para Deploy preview.

## Calidad y monitoreo

- **Testing**:
  - Unitarios: lógica pura, hooks y utils (`vitest + @testing-library/react`).
  - Integración: páginas con MSW simulando respuestas reales.
  - E2E: flujos críticos (cierre mensual, importaciones, asignaciones).
- **Cobertura**: objetivo ≥ 80 % en `shared/` y módulos core (Costos, Consumos, Reportes).
- **Accesibilidad**: usar `@axe-core/react` en desarrollo y `cypress-axe` en E2E.
- **Performance**: auditar con Lighthouse/React Profiler; implementar `React.Suspense` y división de código por dominio.
- **Observabilidad**: integrar logging de frontend (Sentry/LogRocket) para capturar errores y reproducción de flujos.

## Checklist previo a release

1. Navegación y rutas alineadas con el blueprint funcional.【F:frontend-description/system-overview.md†L1-L75】
2. Tokens de fecha de cálculo y catálogos refrescándose en todo el AppShell.【F:frontend-description/frontend-architecture.md†L23-L88】
3. Tablas críticas con exportación y filtros persistentes.【F:frontend-description/frontend-architecture.md†L52-L87】【F:frontend-description/ui-ux-guidelines.md†L57-L125】
4. Procesos largos con feedback y banners de estado (`warning`, `balance`).【F:frontend-description/frontend-architecture.md†L52-L88】【F:frontend-description/ui-ux-guidelines.md†L73-L115】
5. Pruebas automatizadas y accesibilidad verificadas.

Adoptar estas pautas permitirá iniciar el desarrollo del frontend con un marco claro, minimizar divergencias entre módulos y asegurar la calidad esperada por negocio y usuarios finales.
