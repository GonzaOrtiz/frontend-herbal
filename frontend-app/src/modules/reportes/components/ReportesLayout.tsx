import React from 'react';
import AdvancedFilters from './AdvancedFilters';
import type { ReportFilters } from '../types';
import '../reportes.css';

interface ReportesLayoutProps {
  filterDescriptors: Array<{ id: keyof ReportFilters; label: string; helper?: string }>;
  children: React.ReactNode;
}

const ReportesLayout: React.FC<ReportesLayoutProps> = ({ filterDescriptors, children }) => (
  <div className="reportes-module">
    <AdvancedFilters descriptors={filterDescriptors} />
    <div className="reportes-module__content">{children}</div>
  </div>
);

export default ReportesLayout;
