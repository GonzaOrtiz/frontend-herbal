import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  FiltroPersistente,
  OperacionModulo,
  ResumenContextual,
  VistaGuardada,
} from '../types';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';
import { generateOperacionId } from '../utils/id';

interface OperacionContextValue {
  modulo: OperacionModulo;
  setModulo: (modulo: OperacionModulo) => void;
  filtros: FiltroPersistente;
  updateFiltros: (partial: Partial<FiltroPersistente>) => void;
  resetFiltros: () => void;
  resumen: ResumenContextual | null;
  setResumen: (resumen: ResumenContextual | null) => void;
  vistas: VistaGuardada[];
  saveVista: (vista: Omit<VistaGuardada, 'id' | 'createdAt'>) => VistaGuardada;
  deleteVista: (id: string) => void;
  shareVista: (id: string) => string;
}

const DEFAULT_MODULO: OperacionModulo = 'consumos';
const VIEWS_KEY = 'operacion:vistas';

const OperacionContext = createContext<OperacionContextValue | undefined>(undefined);

function getDefaultFilters(modulo: OperacionModulo): FiltroPersistente {
  const today = new Date();
  const iso = today.toISOString().slice(0, 10);
  switch (modulo) {
    case 'consumos':
      return {
        calculationDate: iso,
        centro: 'CENTRO-GENERAL',
        actividad: 'CAPTURA',
        rango: { desde: iso, hasta: iso },
      };
    case 'producciones':
      return {
        calculationDate: iso,
        orden: 'ORD-PLANEADA',
        turno: 'M1',
        rango: { desde: iso, hasta: iso },
      };
    case 'litros':
      return {
        calculationDate: iso,
        lote: 'LOTE-ACTUAL',
        turno: 'M1',
      };
    case 'perdidas':
      return {
        calculationDate: iso,
        centro: 'CENTRO-GENERAL',
      };
    case 'sobrantes':
      return {
        calculationDate: iso,
        centro: 'CENTRO-GENERAL',
        lote: 'LOTE-ACTUAL',
      };
    default:
      return { calculationDate: iso };
  }
}

interface OperacionProviderProps {
  initialModulo?: OperacionModulo;
  children: React.ReactNode;
}

export const OperacionProvider: React.FC<OperacionProviderProps> = ({ initialModulo, children }) => {
  const [modulo, setModulo] = useState<OperacionModulo>(initialModulo ?? DEFAULT_MODULO);
  const [filtros, setFiltros] = useState<FiltroPersistente>(() =>
    getLocalStorageItem(`operacion:${modulo}:filters`, getDefaultFilters(modulo))
  );
  const [resumen, setResumen] = useState<ResumenContextual | null>(null);
  const [vistas, setVistas] = useState<VistaGuardada[]>(() => getLocalStorageItem(VIEWS_KEY, []));

  useEffect(() => {
    setFiltros(getLocalStorageItem(`operacion:${modulo}:filters`, getDefaultFilters(modulo)));
  }, [modulo]);

  useEffect(() => {
    setLocalStorageItem(`operacion:${modulo}:filters`, filtros);
  }, [modulo, filtros]);

  useEffect(() => {
    setLocalStorageItem(VIEWS_KEY, vistas);
  }, [vistas]);

  const value = useMemo<OperacionContextValue>(() => ({
    modulo,
    setModulo,
    filtros,
    updateFiltros: (partial) => setFiltros((prev) => ({ ...prev, ...partial })),
    resetFiltros: () => setFiltros(getDefaultFilters(modulo)),
    resumen,
    setResumen,
    vistas,
    saveVista: (payload) => {
      const vista: VistaGuardada = {
        ...payload,
        id: generateOperacionId('vista'),
        createdAt: new Date().toISOString(),
      };
      setVistas((prev) => [...prev, vista]);
      return vista;
    },
    deleteVista: (id) => setVistas((prev) => prev.filter((vista) => vista.id !== id)),
    shareVista: (id) => {
      const base = typeof window !== 'undefined' ? window.location.origin : 'operacion';
      return `${base}/operacion?view=${id}`;
    },
  }), [modulo, filtros, resumen, vistas]);

  return <OperacionContext.Provider value={value}>{children}</OperacionContext.Provider>;
};

export function useOperacionContext(): OperacionContextValue {
  const context = useContext(OperacionContext);
  if (!context) {
    throw new Error('useOperacionContext debe usarse dentro de OperacionProvider');
  }
  return context;
}
