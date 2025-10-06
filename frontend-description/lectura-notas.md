# Notas de lectura de la documentación del frontend

## Plan de implementación
- El plan se compone de ocho pasos que van desde la alineación inicial hasta el despliegue y soporte continuo, cada uno con artefactos, checklist, entregables y criterios de aceptación claramente definidos.【F:frontend-description/plan-implementacion/README.md†L3-L24】【F:frontend-description/plan-implementacion/paso-08-calidad-despliegue.md†L3-L45】
- El primer paso exige alinear equipos, definir objetivos de UX/UI, priorizar flujos funcionales y configurar herramientas de seguimiento antes de escribir código.【F:frontend-description/plan-implementacion/paso-01-preparativos.md†L1-L40】

## Arquitectura y lineamientos
- La arquitectura propone un app shell con header, sidebar y rutas anidadas que agrupan dominios como Configuración, Operación diaria, Costos y Reportes, apoyándose en React, Vite, React Query y un store global para la fecha de cálculo y catálogos.【F:frontend-description/frontend-architecture.md†L1-L87】【F:frontend-description/development-guidelines.md†L7-L55】
- Las guías UI/UX priorizan accesibilidad AA, feedback inmediato, filtros persistentes y exportaciones consistentes, además de un sistema de diseño basado en tokens compartidos.【F:frontend-description/ui-ux-guidelines.md†L1-L83】【F:frontend-description/ui-ux-guidelines.md†L91-L153】
- La referencia rápida de API centraliza las rutas bajo `/api`, documenta el uso de la cabecera `x-user` y detalla endpoints por dominio para facilitar la integración del frontend.【F:frontend-description/api-reference.md†L1-L38】【F:frontend-description/api-reference.md†L118-L187】

## Módulos funcionales destacados
- **Configuración**: incluye catálogos, actividades, empleados, centros y fecha de cálculo con formularios modales, validaciones básicas y auditoría mediante `x-user` cuando aplica.【F:frontend-description/catalogos.md†L1-L104】【F:frontend-description/fecha-calculo.md†L1-L49】
- **Operación diaria**: abarca consumos, producciones, producción y litros de crema, pérdidas y sobrantes, todos con filtros por fecha, badges de importación (`accessId`) y soporte para importaciones desde Access.【F:frontend-description/consumos.md†L1-L53】【F:frontend-description/litros-crema.md†L1-L43】【F:frontend-description/sobrantes.md†L1-L38】
- **Asignaciones y distribución**: gestiona horas por actividad, prorrateos entre centros y costos finales, usando formularios maestro-detalle y timelines para auditoría.【F:frontend-description/asignacion-actividad-empleado.md†L1-L50】【F:frontend-description/asignacion-historial.md†L1-L40】【F:frontend-description/centros-asignaciones.md†L1-L44】
- **Costos y consolidaciones**: cubre gastos, depreciaciones, sueldos, CIF, existencias y asientos, con feedback de `balance`/`warning` y procesos largos como prorrateos y consolidaciones.【F:frontend-description/costos.md†L1-L68】【F:frontend-description/cif.md†L1-L53】【F:frontend-description/existencias.md†L1-L52】
- **Reportes e importaciones**: provee vistas analíticas con exportaciones CSV/XLSX y un módulo de importación MDB con progreso detallado y bitácoras gestionables.【F:frontend-description/reportes.md†L1-L44】【F:frontend-description/importacion.md†L1-L57】

## Dependencias y flujo operativo
- El blueprint funcional resalta que la fecha de cálculo orquesta los módulos; las consolidaciones de existencias generan asientos de control y alimentan los reportes comparativos para cerrar cada período.【F:frontend-description/system-overview.md†L1-L55】【F:frontend-description/system-overview.md†L186-L200】
- El roadmap sugiere iniciar con cimientos técnicos, construir el app shell, luego catálogos, operación diaria, costos, reportes y finalmente calidad y despliegue, asegurando invalidaciones y monitoreo continuo.【F:frontend-description/README.md†L27-L74】
