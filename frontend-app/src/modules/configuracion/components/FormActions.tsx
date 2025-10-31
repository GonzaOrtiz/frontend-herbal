import React from 'react';
import '../configuracion.css';

interface FormActionsProps {
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, isSubmitting, submitLabel = 'Guardar' }) => (
  <div className="config-form-actions">
    <button type="submit" className="primary" disabled={isSubmitting}>
      {submitLabel}
    </button>
    {onCancel && (
      <button type="button" className="ghost" onClick={onCancel}>
        Cancelar
      </button>
    )}
  </div>
);

export default FormActions;
