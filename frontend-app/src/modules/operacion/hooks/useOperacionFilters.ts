import { useEffect } from 'react';
import { useOperacionContext } from '../context/OperacionContext';
import type { OperacionModulo } from '../types';

export function useOperacionFilters() {
  const { modulo, setModulo, filtros, updateFiltros, resetFiltros, vistas } = useOperacionContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('view');
    if (!viewId) return;
    const vista = vistas.find((item) => item.id === viewId);
    if (!vista) return;
    if (vista.modulo !== modulo) {
      setModulo(vista.modulo);
    }
    updateFiltros(vista.filtros);
  }, [vistas, modulo, setModulo, updateFiltros]);

  const setModuloSeguro = (nuevoModulo: OperacionModulo) => {
    if (nuevoModulo === modulo) return;
    setModulo(nuevoModulo);
  };

  return {
    modulo,
    setModulo: setModuloSeguro,
    filtros,
    updateFiltros,
    resetFiltros,
  };
}
