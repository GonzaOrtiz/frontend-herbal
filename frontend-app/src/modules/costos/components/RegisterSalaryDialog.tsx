import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@/lib/query/QueryClient';
import apiClient from '@/lib/http/apiClient';
import '../costos.css';

interface RegisterSalaryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

interface CentroOption {
  id: string;
  nombre: string;
  nroCentro: number;
}

interface EmpleadoOption {
  id: string;
  nombre: string;
  nroEmpleado: number;
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

function normalizeCollection(response: unknown): unknown[] {
  if (Array.isArray(response)) {
    return response;
  }

  if (response && typeof response === 'object') {
    const data = response as Record<string, unknown>;
    const possibleArrays = [data.items, data.data, data.results, data.result, data.centros, data.empleados];
    const collection = possibleArrays.find((value): value is unknown[] => Array.isArray(value));
    if (collection) {
      return collection;
    }
  }

  return [];
}

function mapCentro(entity: any): CentroOption {
  return {
    id: entity?._id ? String(entity._id) : String(entity?.id ?? entity?.nroCentro ?? ''),
    nombre: entity?.nombre ?? entity?.descripcion ?? 'Sin nombre',
    nroCentro: Number(entity?.nroCentro ?? entity?.nro ?? 0),
  };
}

function mapEmpleado(entity: any): EmpleadoOption {
  const nroEmpleado = Number(entity?.Nroem ?? entity?.nroEmpleado ?? entity?.empleadoId ?? 0);
  return {
    id: entity?._id ? String(entity._id) : String(entity?.id ?? nroEmpleado ?? ''),
    nombre: entity?.nombre ?? entity?.Nombre ?? 'Sin nombre',
    nroEmpleado,
  };
}

async function fetchCentros(): Promise<CentroOption[]> {
  const response = await apiClient.get<unknown>('/ceapi/centros-produccion');
  return normalizeCollection(response)
    .map(mapCentro)
    .filter((centro) => Number.isFinite(centro.nroCentro));
}

async function fetchEmpleados(): Promise<EmpleadoOption[]> {
  const response = await apiClient.get<unknown>('/api/empleados');
  return normalizeCollection(response)
    .map(mapEmpleado)
    .filter((empleado) => Number.isFinite(empleado.nroEmpleado));
}

const RegisterSalaryDialog: React.FC<RegisterSalaryDialogProps> = ({ open, onClose, onSuccess }) => {
  const [formState, setFormState] = useState<SalaryFormState>(initialState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const centrosQuery = useQuery<CentroOption[]>({
    queryKey: ['costos', 'centros-produccion'],
    queryFn: fetchCentros,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const empleadosQuery = useQuery<EmpleadoOption[]>({
    queryKey: ['costos', 'empleados'],
    queryFn: fetchEmpleados,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (open) {
      setFormState(initialState);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const isLoading = centrosQuery.status === 'loading' || empleadosQuery.status === 'loading';
  const hasError = centrosQuery.status === 'error' || empleadosQuery.status === 'error';

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

    const centros = centrosQuery.data ?? [];
    const empleados = empleadosQuery.data ?? [];

    const centro = centros.find((item) => String(item.nroCentro) === formState.centro || item.id === formState.centro);
    const empleado = empleados.find(
      (item) => String(item.nroEmpleado) === formState.empleado || item.id === formState.empleado,
    );

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
              disabled={isLoading || hasError || centrosQuery.data?.length === 0}
              required
            >
              <option value="" disabled>
                Selecciona un centro
              </option>
              {(centrosQuery.data ?? []).map((centro) => (
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
              disabled={isLoading || hasError || empleadosQuery.data?.length === 0}
              required
            >
              <option value="" disabled>
                Selecciona un empleado
              </option>
              {(empleadosQuery.data ?? []).map((empleado) => (
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
              void centrosQuery.refetch();
              void empleadosQuery.refetch();
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
