import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from '@/lib/router/useSearchParams';
import {
  buildShareableLink,
  compareFilters,
  isFilterCombinationValid,
  parseFiltersFromSearch,
  serializeFiltersToSearch,
} from '../utils/filters';
import type { ReportCategory, ReportFilters, ReportPreset } from '../types';

interface ReportesContextValue {
  category: ReportCategory;
  setCategory: (category: ReportCategory) => void;
  filters: ReportFilters;
  updateFilters: (partial: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  isValidCombination: boolean;
  shareableLink: string;
  presets: ReportPreset[];
  savePreset: (name: string) => ReportPreset | null;
  applyPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const ReportesContext = createContext<ReportesContextValue | undefined>(undefined);

const PRESETS_KEY = 'reportes:presets';

function loadPresets(): ReportPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: String(item.id ?? crypto.randomUUID()),
        name: String(item.name ?? 'Preset sin nombre'),
        filters: (item.filters ?? {}) as ReportFilters,
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }))
      .slice(0, 50);
  } catch (error) {
    console.error('No se pudieron cargar los presets de reportes', error);
    return [];
  }
}

function persistPresets(presets: ReportPreset[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

interface ProviderProps {
  initialCategory?: ReportCategory;
  onCategoryChange?: (category: ReportCategory) => void;
  children: React.ReactNode;
}

const defaultFilters: ReportFilters = {};

export const ReportesProvider: React.FC<ProviderProps> = ({
  initialCategory = 'financieros',
  onCategoryChange,
  children,
}) => {
  const [category, setCategoryState] = useState<ReportCategory>(initialCategory);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<ReportFilters>(() => parseFiltersFromSearch(searchParams));
  const [presets, setPresets] = useState<ReportPreset[]>(() => loadPresets());
  const lastFiltersRef = useRef<ReportFilters>(filters);

  useEffect(() => {
    setCategoryState(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setFilters(parseFiltersFromSearch(searchParams));
  }, [searchParams]);

  const setCategory = useCallback(
    (next: ReportCategory) => {
      setCategoryState(next);
      onCategoryChange?.(next);
    },
    [onCategoryChange],
  );

  const updateFilters = useCallback(
    (partial: Partial<ReportFilters>) => {
      setFilters((current) => {
        const next = { ...current, ...partial };
        const normalized = parseFiltersFromSearch(serializeFiltersToSearch(next));
        setSearchParams(serializeFiltersToSearch(normalized), { replace: true });
        lastFiltersRef.current = normalized;
        return normalized;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams(), { replace: true });
    lastFiltersRef.current = defaultFilters;
  }, [setSearchParams]);

  const isValidCombination = useMemo(() => isFilterCombinationValid(filters), [filters]);

  const shareableLink = useMemo(() => buildShareableLink(filters), [filters]);

  const savePreset = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const preset: ReportPreset = {
        id: crypto.randomUUID(),
        name: trimmed,
        filters,
        createdAt: new Date().toISOString(),
      };
      setPresets((current) => {
        const next = [preset, ...current].slice(0, 50);
        persistPresets(next);
        return next;
      });
      return preset;
    },
    [filters],
  );

  const applyPreset = useCallback(
    (id: string) => {
      const preset = presets.find((item) => item.id === id);
      if (!preset) return;
      if (compareFilters(preset.filters, lastFiltersRef.current)) return;
      const params = serializeFiltersToSearch(preset.filters);
      setSearchParams(params, { replace: true });
      setFilters(preset.filters);
      lastFiltersRef.current = preset.filters;
    },
    [presets, setSearchParams],
  );

  const deletePreset = useCallback((id: string) => {
    setPresets((current) => {
      const next = current.filter((item) => item.id !== id);
      persistPresets(next);
      return next;
    });
  }, []);

  const value = useMemo<ReportesContextValue>(
    () => ({
      category,
      setCategory,
      filters,
      updateFilters,
      resetFilters,
      isValidCombination,
      shareableLink,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
    }),
    [
      category,
      setCategory,
      filters,
      updateFilters,
      resetFilters,
      isValidCombination,
      shareableLink,
      presets,
      savePreset,
      applyPreset,
      deletePreset,
    ],
  );

  return <ReportesContext.Provider value={value}>{children}</ReportesContext.Provider>;
};

export function useReportesContext(): ReportesContextValue {
  const context = useContext(ReportesContext);
  if (!context) {
    throw new Error('useReportesContext debe utilizarse dentro de ReportesProvider');
  }
  return context;
}
