import React from 'react';

interface ReportSectionProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const ReportSection: React.FC<ReportSectionProps> = ({ title, description, actions, children }) => (
  <section className="reportes-module__section">
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {actions && <div>{actions}</div>}
    </header>
    <div>{children}</div>
  </section>
);

export default ReportSection;
