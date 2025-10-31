import React from 'react';

const ReportSkeleton: React.FC = () => (
  <div className="reportes-skeleton" aria-hidden="true">
    <div className="reportes-skeleton__card" />
    <div className="reportes-skeleton__card" />
    <div className="reportes-skeleton__table" />
  </div>
);

export default ReportSkeleton;
