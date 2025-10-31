interface HttpErrorLog {
  url: string;
  method: string;
  status?: number;
  payload: unknown;
}

const listeners: Array<(entry: HttpErrorLog) => void> = [];

export function logHttpError(entry: HttpErrorLog) {
  if (import.meta.env?.MODE !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[http-error]', entry);
  }
  listeners.forEach((listener) => listener(entry));
}

export function onHttpError(listener: (entry: HttpErrorLog) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
}

export type { HttpErrorLog };
