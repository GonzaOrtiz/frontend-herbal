# Paso 8. Calidad, despliegue y mejoras continuas

**Objetivo:** Garantizar la estabilidad del frontend y preparar el lanzamiento controlado.

## Actividades principales
- Implementar pruebas E2E con Cypress para los flujos definidos en pasos anteriores.
- Configurar pipelines de CI/CD que ejecuten lint, pruebas unitarias, pruebas E2E y build de producción.
- Verificar que el proyecto cumple con la [guía de despliegue en plataformas serverless](../deployment.md) y registrar en CI los comandos `npm run build` y `npm run preview`.
- Realizar auditorías de accesibilidad (Lighthouse, axe) y rendimiento (Core Web Vitals).
- Preparar documentación de usuario final con capturas de pantalla y tutoriales.
- Planificar la retroalimentación posterior al lanzamiento y el backlog de mejoras continuas.

## Entregables
- Dashboard de CI/CD con build verde y reportes de pruebas.
- Informe de accesibilidad y rendimiento con acciones de mejora.
- Manual de usuario y plan de soporte post-lanzamiento.

## Criterios de aceptación
- El build de producción se despliega en un entorno de staging listo para pruebas de aceptación.
- Las plataformas serverless (Vercel, Netlify u otras) cuentan con variables de entorno, reglas de routing y headers configurados según la guía de despliegue.
- Todas las métricas críticas se encuentran dentro de los umbrales definidos (performance, accesibilidad, estabilidad).
- Existe un plan de mantenimiento y monitoreo continuo.