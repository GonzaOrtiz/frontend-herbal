export function getLocalStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }
  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`[operacion] No se pudo leer ${key} de localStorage`, error);
    return fallback;
  }
}

export function setLocalStorageItem<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[operacion] No se pudo guardar ${key} en localStorage`, error);
  }
}
