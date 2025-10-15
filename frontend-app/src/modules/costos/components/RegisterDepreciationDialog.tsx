import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/http/apiClient';
import { useCentros } from '../../configuracion/hooks/useCentros';
import '../costos.css';

interface RegisterDepreciationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface DepreciationFormState {
  centro: string;
  fechaCalculo: string;
  maquina: string;
  depreMensual: string;
  vidaUtil: string;
  valorUso: string;
  periodo: string;
}

const initialState: DepreciationFormState = {
  centro: '',
  fechaCalculo: '',
  maquina: '',
  depreMensual: '',
  vidaUtil: '',
  valorUso: '',
  periodo: '',
};

const RegisterDepreciationDialog: React.FC<RegisterDepreciationDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formState, setFormState] = useState<DepreciationFormState>(initialState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { items: centrosItems, refetch: refetchCentros, isLoading, error } = useCentros();

  useEffect(() => {
    if (open) {
      setFormState(initialState);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      refetchCentros();
    }
  }, [open, refetchCentros]);

  const centros = useMemo(
    () =>
      centrosItems
        .filter((centro) => Number.isFinite(centro.nroCentro))
        .map((centro) => ({
          id: centro.id,
          nombre: centro.nombre || 'Sin nombre',
          nroCentro: centro.nroCentro,
        }))
        .sort((a, b) => a.nroCentro - b.nroCentro),
    [centrosItems],
  );

  const hasError = Boolean(error);
  const isInitialLoading = isLoading && centros.length === 0;

  const canSubmit =
    !isInitialLoading &&
    !hasError &&
    formState.centro !== '' &&
    formState.fechaCalculo !== '' &&
    formState.maquina.trim() !== '' &&
    formState.depreMensual !== '' &&
    Number(formState.depreMensual) > 0 &&
    formState.vidaUtil !== '' &&
    Number(formState.vidaUtil) > 0 &&
    formState.valorUso !== '' &&
    Number(formState.valorUso) >= 0 &&
    formState.periodo.trim() !== '';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) {
      return;
    }

    const centro = centros.find((item) => String(item.nroCentro) === formState.centro || item.id === formState.centro);
    const centroNumero = centro?.nroCentro ?? Number.parseInt(formState.centro, 10);

    if (!Number.isFinite(centroNumero)) {
      setSubmitError('No se pudo identificar el centro seleccionado.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        centro: centroNumero,
        fechaCalculo: formState.fechaCalculo,
        maquina: formState.maquina.trim(),
        depreMensual: Number(formState.depreMensual),
        vidaUtil: Number(formState.vidaUtil),
        valorUso: Number(formState.valorUso),
        periodo: formState.periodo.trim(),
      };

      await apiClient.post('/api/costos/depreciacion', payload);

      await Promise.resolve(onSuccess());
    } catch (error) {
      setSubmitError('No se pudo registrar la depreciación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  const submitLabel = isSubmitting ? 'Guardando…' : 'Registrar';

  return (
    <div className="costos-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Registrar depreciación">
      <div className="costos-dialog">
        <header>
          <h2>Registrar depreciación</h2>
          <p className="costos-metadata">
            Completa los datos necesarios para crear una nueva depreciación asociada a un centro de producción.
          </p>
        </header>
        <form
          id="register-depreciation-form"
          className="costos-dialog__body costos-salary-form"
          onSubmit={handleSubmit}
        >
          {isInitialLoading && !hasError && (
            <p className="costos-hint" aria-live="polite">
              Cargando catálogos…
            </p>
          )}
          {hasError && (
            <p className="costos-error" role="alert">
              No se pudieron cargar los catálogos. Intenta nuevamente más tarde.
            </p>
          )}
          <label className="costos-field">
            <span>Centro</span>
            <select
              name="centro"
              value={formState.centro}
              onChange={handleChange}
              disabled={isInitialLoading || hasError || centros.length === 0}
              required
            >
              <option value="" disabled>
                Selecciona un centro
              </option>
              {centros.map((centro) => (
                <option key={`${centro.id}-${centro.nroCentro}`} value={String(centro.nroCentro)}>
                  {centro.nroCentro.toString().padStart(3, '0')} · {centro.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="costos-field">
            <span>Fecha de cálculo</span>
            <input type="date" name="fechaCalculo" value={formState.fechaCalculo} onChange={handleChange} required />
          </label>
          <label className="costos-field">
            <span>Máquina</span>
            <input type="text" name="maquina" value={formState.maquina} onChange={handleChange} required />
          </label>
          <label className="costos-field">
            <span>Depreciación mensual</span>
            <input
              type="number"
              name="depreMensual"
              value={formState.depreMensual}
              onChange={handleChange}
              min="0"
              step="0.01"
              inputMode="decimal"
              required
            />
          </label>
          <label className="costos-field">
            <span>Vida útil (meses)</span>
            <input
              type="number"
              name="vidaUtil"
              value={formState.vidaUtil}
              onChange={handleChange}
              min="1"
              step="1"
              inputMode="numeric"
              required
            />
          </label>
          <label className="costos-field">
            <span>Valor en uso</span>
            <input
              type="number"
              name="valorUso"
              value={formState.valorUso}
              onChange={handleChange}
              min="0"
              step="0.01"
              inputMode="decimal"
              required
            />
          </label>
          <label className="costos-field">
            <span>Periodo</span>
            <input type="date" name="periodo" value={formState.periodo} onChange={handleChange} required />
          </label>
          {submitError && (
            <p className="costos-error" role="alert">
              {submitError}
            </p>
          )}
        </form>
        <div className="costos-dialog__footer">
          <button type="button" className="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              void refetchCentros();
            }}
            disabled={isInitialLoading}
          >
            Actualizar catálogos
          </button>
          <button
            type="submit"
            className="primary"
            form="register-depreciation-form"
            disabled={!canSubmit || isSubmitting}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterDepreciationDialog;
