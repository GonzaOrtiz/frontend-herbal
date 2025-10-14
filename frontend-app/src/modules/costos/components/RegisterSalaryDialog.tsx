import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/http/apiClient';
import { useCentros } from '../../configuracion/hooks/useCentros';
import { useEmpleados } from '../../configuracion/hooks/useEmpleados';
import '../costos.css';

interface RegisterSalaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface SalaryFormState {
  centro: string;
  empleado: string;
  fechaSueldo: string;
  fechaCalculo: string;
  sueldoTotal: string;
}

const initialState: SalaryFormState = {
  centro: '',
  empleado: '',
  fechaSueldo: '',
  fechaCalculo: '',
  sueldoTotal: '',
};

const RegisterSalaryDialog: React.FC<RegisterSalaryDialogProps> = ({ open, onClose, onSuccess }) => {
  const [formState, setFormState] = useState<SalaryFormState>(initialState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    items: centrosItems,
    refetch: refetchCentros,
    isLoading: isLoadingCentros,
    error: centrosError,
  } = useCentros();
  const {
    items: empleadosItems,
    refetch: refetchEmpleados,
    isLoading: isLoadingEmpleados,
    error: empleadosError,
  } = useEmpleados();

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
      refetchEmpleados();
    }
  }, [open, refetchCentros, refetchEmpleados]);

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

  const empleados = useMemo(
    () =>
      empleadosItems
        .filter((empleado) => Number.isFinite(empleado.nroEmpleado))
        .map((empleado) => ({
          id: empleado.id,
          nombre: empleado.nombre || 'Sin nombre',
          nroEmpleado: empleado.nroEmpleado,
        }))
        .sort((a, b) => a.nroEmpleado - b.nroEmpleado),
    [empleadosItems],
  );

  const isLoading =
    (isLoadingCentros && centros.length === 0) || (isLoadingEmpleados && empleados.length === 0);
  const hasError = Boolean(centrosError || empleadosError);

  const canSubmit = useMemo(() => {
    if (isLoading || hasError) {
      return false;
    }

    return (
      formState.centro !== '' &&
      formState.empleado !== '' &&
      formState.fechaSueldo !== '' &&
      formState.fechaCalculo !== '' &&
      formState.sueldoTotal !== '' &&
      Number(formState.sueldoTotal) > 0
    );
  }, [formState, hasError, isLoading]);

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
    const empleado = empleados.find((item) => String(item.nroEmpleado) === formState.empleado || item.id === formState.empleado);

    if (!centro || !empleado) {
      setSubmitError('No se pudo identificar el centro o empleado seleccionado.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await apiClient.post('/api/costos/sueldo', {
        centro: centro.nroCentro,
        nroEmpleado: empleado.nroEmpleado,
        nombre: empleado.nombre,
        fechaSueldo: formState.fechaSueldo,
        sueldoTotal: Number(formState.sueldoTotal),
        fechaCalculo: formState.fechaCalculo,
      });

      await Promise.resolve(onSuccess());
    } catch (error) {
      setSubmitError('No se pudo registrar el sueldo. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="costos-dialog-backdrop" role="dialog" aria-modal="true" aria-label="Registrar sueldo">
      <div className="costos-dialog">
        <header>
          <h2>Registrar sueldo</h2>
          <p className="costos-metadata">
            Completa los datos necesarios para crear un nuevo sueldo asociado a un centro de producción y un empleado.
          </p>
        </header>
        <form
          id="register-salary-form"
          className="costos-dialog__body costos-salary-form"
          onSubmit={handleSubmit}
        >
          {isLoading && !hasError && (
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
              disabled={isLoading || hasError || centros.length === 0}
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
            <span>Empleado</span>
            <select
              name="empleado"
              value={formState.empleado}
              onChange={handleChange}
              disabled={isLoading || hasError || empleados.length === 0}
              required
            >
              <option value="" disabled>
                Selecciona un empleado
              </option>
              {empleados.map((empleado) => (
                <option key={`${empleado.id}-${empleado.nroEmpleado}`} value={String(empleado.nroEmpleado)}>
                  {empleado.nroEmpleado.toString().padStart(3, '0')} · {empleado.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="costos-field">
            <span>Fecha de sueldo</span>
            <input
              type="date"
              name="fechaSueldo"
              value={formState.fechaSueldo}
              onChange={handleChange}
              required
            />
          </label>
          <label className="costos-field">
            <span>Fecha de cálculo</span>
            <input
              type="date"
              name="fechaCalculo"
              value={formState.fechaCalculo}
              onChange={handleChange}
              required
            />
          </label>
          <label className="costos-field">
            <span>Sueldo total</span>
            <input
              type="number"
              name="sueldoTotal"
              value={formState.sueldoTotal}
              onChange={handleChange}
              min="0"
              step="0.01"
              inputMode="decimal"
              required
            />
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
              void refetchEmpleados();
            }}
            disabled={isLoading}
          >
            Actualizar catálogos
          </button>
          <button
            type="submit"
            className="primary"
            form="register-salary-form"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? 'Guardando…' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSalaryDialog;
