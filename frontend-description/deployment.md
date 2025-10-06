diff --git a//dev/null b/frontend-description/deployment.md
index 0000000000000000000000000000000000000000..6714780e7f1ca5a665c38a52f8fac7d7e0968bc5 100644
--- a//dev/null
+++ b/frontend-description/deployment.md
@@ -0,0 +1,69 @@
+# Guía de despliegue en plataformas serverless
+
+Esta guía resume los requisitos y configuraciones necesarias para que el frontend pueda desplegarse sin ajustes adicionales en servicios como Vercel, Netlify o similares.
+
+## Requisitos previos
+
+- Aplicación compilable como sitio estático mediante `npm run build` (Vite/React) o el comando equivalente definido en `package.json`.
+- Variables de entorno gestionadas con prefijo `VITE_` (en caso de usar Vite) o siguiendo la convención del bundler para ser expuestas en el bundle.
+- Archivo `index.html` ubicado en la raíz del directorio de salida (`dist/` por defecto) y rutas basadas en history API con fallback al mismo documento.
+
+## Configuración recomendada
+
+### Variables de entorno
+
+1. Definir los valores en archivos `.env` versionados por entorno (`.env.development`, `.env.production`).
+2. Registrar las variables sensibles (por ejemplo `VITE_API_BASE_URL`, `VITE_AUTH_CLIENT_ID`) directamente en el dashboard del proveedor.
+3. Evitar exponer secretos en el código fuente; utilice variables públicas únicamente para endpoints HTTP y configuraciones no sensibles.
+
+### Comandos de build y preview
+
+- **Build**: `npm run build`
+- **Preview/Serve**: `npm run preview`
+- **Dependencias de instalación**: `npm install` (o `pnpm install` si se adopta PNPM)
+
+Documente estos comandos en el README del proyecto o en la configuración del pipeline para que puedan ser referenciados por cualquier plataforma serverless.
+
+### Routing
+
+- Para aplicaciones con rutas cliente, habilite el fallback a `index.html`:
+  - **Netlify**: cree un archivo `_redirects` con la línea `/*    /index.html   200`.
+  - **Vercel**: agregue en `vercel.json` un rewrite hacia `/index.html`.
+- Si se usan rutas con prefijo (`/app`, `/reportes`), asegúrese de que las reglas de rewrite las contemplen.
+
+### Caché y headers
+
+- Configure headers para cacheo estático (`Cache-Control: public, max-age=31536000, immutable`) sobre activos con hash.
+- Incluya headers de seguridad básicos (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`) desde la plataforma o mediante un archivo `netlify.toml` / `vercel.json`.
+
+## Integración con Vercel
+
+1. Conecte el repositorio y seleccione el framework "Vite" o "Other".
+2. Configure los comandos anteriores en el panel.
+3. Asigne las variables de entorno en el apartado *Environment Variables* para Production y Preview.
+4. Active *Deploy Previews* para cada PR y comparta las URLs con QA.
+5. Opcional: defina reglas de protección para branches principales (`production`, `main`).
+
+## Integración con Netlify
+
+1. Vincule el repositorio y utilice el build command `npm run build` y publish directory `dist`.
+2. Cree el archivo `_redirects` mencionado para soportar SPA routing.
+3. Ingrese las variables de entorno en *Site settings → Build & deploy → Environment*.
+4. Habilite *Deploy Previews* y revise los logs desde la sección *Deploys*.
+5. Opcional: configure funciones de Netlify para proxys si se requiere ocultar la URL del backend.
+
+## Validaciones previas al deploy
+
+- Ejecutar `npm run lint`, `npm run test`, `npm run build` en CI antes de cada despliegue.
+- Validar que el `dist/` generado no incluya dependencias de Node y que los assets estén minificados.
+- Revisar Lighthouse en la preview y registrar resultados en el tablero de calidad.
+- Confirmar que la aplicación maneja correctamente la URL base definida en producción (ej.: `https://api.empresa.com`).
+
+## Checklist de lanzamiento
+
+- [ ] Variables de entorno cargadas en los proveedores.
+- [ ] Reglas de routing aplicadas y probadas.
+- [ ] Monitorización de errores configurada (Sentry o equivalente) apuntando a los entornos deployados.
+- [ ] Documentación actualizada con el proceso de rollback y puntos de contacto.
+
+Esta guía garantiza que el frontend pueda desplegarse de forma consistente en plataformas serverless y sirve como referencia para el equipo de desarrollo y operaciones.
