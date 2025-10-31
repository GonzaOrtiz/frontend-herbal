import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router/useSearchParams';
import {
  buildShareableLink,
  isFilterCombinationValid,
  normalizeFilters,
  parseFiltersFromSearch,
  serializeFiltersToSearch,
} from '../utils/filters';
import type { ReportCategory, ReportFilters } from '../types';

interface ReportesContextValue {
  category: ReportCategory;
  setCategory: (category: ReportCategory) => void;
  filters: ReportFilters;
  updateFilters: (partial: Partial<ReportFilters>) => void;
  resetFilters: () => void;
  isValidCombination: boolean;
  shareableLink: string;
}

const ReportesContext = createContext<ReportesContextValue | undefined>(undefined);

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
        const normalized = normalizeFilters(next);
        setSearchParams(serializeFiltersToSearch(normalized), { replace: true });
        return normalized;
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const isValidCombination = useMemo(() => isFilterCombinationValid(filters), [filters]);

  const shareableLink = useMemo(() => buildShareableLink(filters), [filters]);

  const value = useMemo<ReportesContextValue>(
    () => ({
      category,
      setCategory,
      filters,
      updateFilters,
      resetFilters,
      isValidCombination,
      shareableLink,
    }),
    [
      category,
      setCategory,
      filters,
      updateFilters,
      resetFilters,
      isValidCombination,
      shareableLink,
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
