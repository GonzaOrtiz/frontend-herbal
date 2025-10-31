/**
 * Inicializador de Sentry inerte para entornos sin dependencias externas.
 * Permite conservar la misma API pública sin requerir el paquete oficial.
 */
export interface SentryOptions {
  dsn?: string;
  tracesSampleRate?: number;
}

export function initSentry(options: SentryOptions): void {
  if (import.meta.env?.MODE !== 'production') {
    console.info('[sentry] Inicialización omitida', options);
  }
}
