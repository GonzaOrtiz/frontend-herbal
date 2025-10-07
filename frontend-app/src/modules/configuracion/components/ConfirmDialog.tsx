import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../configuracion.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) {
      cancelButtonRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="config-modal__backdrop" role="presentation" onClick={onCancel}>
      <div
        className="config-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="config-modal__header">
          <div className="config-modal__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 id={titleId} className="config-modal__title">
            {title}
          </h2>
        </header>
        <p id={descriptionId} className="config-modal__description">
          {description}
        </p>
        <div className="config-modal__actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="config-modal__button"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button type="button" className="config-modal__button config-modal__button--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
