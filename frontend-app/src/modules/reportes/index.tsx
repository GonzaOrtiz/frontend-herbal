import React, { Suspense, useMemo } from 'react';
import ReportesLayout from './components/ReportesLayout';
import ReportSkeleton from './components/ReportSkeleton';
import { ReportesProvider } from './context/ReportesContext';
import type { ReportCategory, ReportFilters } from './types';

const FinancierosPage = React.lazy(() => import('./pages/FinancierosPage'));
const OperativosPage = React.lazy(() => import('./pages/OperativosPage'));
const AuditoriaPage = React.lazy(() => import('./pages/AuditoriaPage'));

const categoryComponentMap: Record<ReportCategory, React.ComponentType> = {
  financieros: FinancierosPage,
  operativos: OperativosPage,
  auditoria: AuditoriaPage,
};

const filterDescriptors: Array<{ id: keyof ReportFilters; label: string; helper?: string }> = [
  { id: 'periodo', label: 'Periodo (mes)', helper: 'Selecciona el mes de análisis (formato AAAA-MM).' },
  { id: 'producto', label: 'Producto', helper: 'Filtra por nombre o clave de producto.' },
  { id: 'centro', label: 'Centro de costos', helper: 'Requiere seleccionar un periodo para habilitarse.' },
  { id: 'format', label: 'Formato preferido' },
];

interface ReportesModuleProps {
  activeCategory: ReportCategory;
  onCategoryChange?: (category: ReportCategory) => void;
}

const ReportesModule: React.FC<ReportesModuleProps> = ({ activeCategory, onCategoryChange }) => {
  const ActiveComponent = useMemo(() => categoryComponentMap[activeCategory], [activeCategory]);

  return (
    <ReportesProvider initialCategory={activeCategory} onCategoryChange={onCategoryChange}>
      <ReportesLayout filterDescriptors={filterDescriptors}>
        <Suspense fallback={<ReportSkeleton />}>
          <ActiveComponent />
        </Suspense>
      </ReportesLayout>
    </ReportesProvider>
  );
};

export default ReportesModule;
