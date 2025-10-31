import React from 'react';
import '../configuracion.css';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => (
  <section className="config-section" aria-labelledby={title.replace(/\s+/g, '-').toLowerCase()}>
    <header>
      <h2 className="config-section__title" id={title.replace(/\s+/g, '-').toLowerCase()}>
        {title}
      </h2>
      {description && <p className="audit-meta">{description}</p>}
    </header>
    <div>{children}</div>
  </section>
);

export default FormSection;
