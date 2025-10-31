import React, { useId, useState } from 'react';

interface ReportSectionProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

const ReportSection: React.FC<ReportSectionProps> = ({
  title,
  description,
  actions,
  children,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const contentId = useId();

  const toggleLabel = collapsed ? 'Expandir sección' : 'Contraer sección';

  return (
    <section
      className={`reportes-module__section${collapsed ? ' reportes-module__section--collapsed' : ''}`}
    >
      <header className="reportes-module__section-header">
        <div className="reportes-module__section-header-content">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {actions && <div className="reportes-module__section-actions">{actions}</div>}
        <button
          type="button"
          className="reportes-module__section-toggle"
          aria-expanded={!collapsed}
          aria-controls={contentId}
          onClick={() => setCollapsed((value) => !value)}
        >
          <span className="sr-only">{toggleLabel}</span>
          <svg
            className="reportes-module__section-toggle-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>
      <div id={contentId} hidden={collapsed} className="reportes-module__section-body">
        {children}
      </div>
    </section>
  );
};

export default ReportSection;
