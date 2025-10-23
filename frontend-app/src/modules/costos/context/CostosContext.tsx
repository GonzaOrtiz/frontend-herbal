import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type {
  BalanceSummaryData,
  CostosFilters,
  CostosProcessState,
  CostosSubModulo,
} from '../types';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/localStorage';

interface CostosContextValue {
  submodule: CostosSubModulo;
  setSubmodule: (submodule: CostosSubModulo) => void;
  filters: CostosFilters;
  updateFilters: (partial: Partial<CostosFilters>) => void;
  resetFilters: () => void;
  lastSummary: BalanceSummaryData | null;
  setLastSummary: (summary: BalanceSummaryData | null) => void;
  processState: CostosProcessState;
  updateProcessState: (updater: (current: CostosProcessState) => CostosProcessState) => void;
}

const DEFAULT_SUBMODULE: CostosSubModulo = 'gastos';
const FILTER_KEY_PREFIX = 'costos:filters:';

const CostosContext = createContext<CostosContextValue | undefined>(undefined);

const defaultFilters: Record<CostosSubModulo, CostosFilters> = {
  gastos: {
    calculationDate: new Date().toISOString().slice(0, 10),
    esGastoDelPeriodo: true,
  },
  depreciaciones: {
    calculationDate: new Date().toISOString().slice(0, 10),
  },
  sueldos: {
    calculationDate: new Date().toISOString().slice(0, 10),
    nroEmpleado: null,
    empleadoQuery: '',
  },
  prorrateo: {
    calculationDate: new Date().toISOString().slice(0, 10),
    esGastoDelPeriodo: true,
  },
};

function resolveFilterSubmodule(submodule: CostosSubModulo): Exclude<CostosSubModulo, 'prorrateo'> {
  return submodule === 'prorrateo' ? 'gastos' : submodule;
}

function getDefaultFilters(submodule: CostosSubModulo): CostosFilters {
  const resolved = resolveFilterSubmodule(submodule);
  const base = defaultFilters[resolved];
  return {
    ...base,
    esGastoDelPeriodo: base.esGastoDelPeriodo ?? (submodule === 'prorrateo' ? true : undefined),
  };
}

interface CostosProviderProps {
  initialSubmodule?: CostosSubModulo;
  children: React.ReactNode;
}

const defaultProcessState: CostosProcessState = {
  status: 'idle',
  progress: 0,
  logs: [],
};

export const CostosProvider: React.FC<CostosProviderProps> = ({ initialSubmodule, children }) => {
  const [submodule, setSubmodule] = useState<CostosSubModulo>(initialSubmodule ?? DEFAULT_SUBMODULE);
  const [filters, setFilters] = useState<CostosFilters>(() => {
    const targetSubmodule = resolveFilterSubmodule(initialSubmodule ?? DEFAULT_SUBMODULE);
    return getLocalStorageItem(
      `${FILTER_KEY_PREFIX}${targetSubmodule}`,
      getDefaultFilters(initialSubmodule ?? DEFAULT_SUBMODULE),
    );
  });
  const [lastSummary, setLastSummary] = useState<BalanceSummaryData | null>(null);
  const [processState, setProcessState] = useState<CostosProcessState>(defaultProcessState);

  useEffect(() => {
    if (!initialSubmodule) {
      return;
    }
    setSubmodule(initialSubmodule);
  }, [initialSubmodule]);

  useEffect(() => {
    const targetSubmodule = resolveFilterSubmodule(submodule);
    setFilters(getLocalStorageItem(`${FILTER_KEY_PREFIX}${targetSubmodule}`, getDefaultFilters(submodule)));
  }, [submodule]);

  useEffect(() => {
    const targetSubmodule = resolveFilterSubmodule(submodule);
    setLocalStorageItem(`${FILTER_KEY_PREFIX}${targetSubmodule}`, filters);
  }, [submodule, filters]);

  const value = useMemo<CostosContextValue>(
    () => ({
      submodule,
      setSubmodule,
      filters,
      updateFilters: (partial) =>
        setFilters((current) => ({
          ...current,
          ...partial,
          ...(submodule === 'prorrateo' &&
          (partial.esGastoDelPeriodo === undefined || partial.esGastoDelPeriodo === null)
            ? { esGastoDelPeriodo: current.esGastoDelPeriodo ?? true }
            : {}),
        })),
      resetFilters: () => setFilters(getDefaultFilters(submodule)),
      lastSummary,
      setLastSummary,
      processState,
      updateProcessState: (updater) =>
        setProcessState((current) => {
          const next = updater(current);
          return { ...current, ...next };
        }),
    }),
    [submodule, filters, lastSummary, processState],
  );

  return <CostosContext.Provider value={value}>{children}</CostosContext.Provider>;
};

export function useCostosContext(): CostosContextValue {
  const context = useContext(CostosContext);
  if (!context) {
    throw new Error('useCostosContext debe usarse dentro de CostosProvider');
  }
  return context;
}
