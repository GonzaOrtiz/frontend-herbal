import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCifTotal,
  createCifUnitario,
  fetchCifTotales,
  fetchCifUnitarios,
  recalculateCif,
} from './api';
import type {
  CifRecalculationResult,
  CifTotalRecord,
  CifUnitarioRecord,
  CreateCifTotalPayload,
  CreateCifUnitarioPayload,
} from './types';
import './cif.css';

type CifSection = 'panel' | 'totales' | 'unitarios' | 'recalculo';

type Filters = {
  producto: string;
  periodo: string; // YYYY-MM
};

type FormStatus = {
  state: 'idle' | 'saving' | 'success' | 'error';
  message: string | null;
};

const emptyFilters: Filters = {
  producto: '',
  periodo: '',
};

const emptyTotalForm = {
  producto: '',
  periodo: '',
  monto: '',
  base: '',
  accessId: '',
};

const emptyUnitarioForm = {
  producto: '',
  periodo: '',
  cantidad: '',
  accessId: '',
};

const emptyRecalculoForm = {
  periodo: '',
};

interface CifModuleProps {
  activeSection: CifSection;
  onSectionChange?: (section: CifSection) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }
  return date.toLocaleDateString();
}

function toIsoPeriod(monthValue: string): string | undefined {
  if (!monthValue) return undefined;
  const trimmed = monthValue.trim();
  if (!trimmed) return undefined;
  return `${trimmed}-01`;
}

function sortByPeriodoDesc<T extends { periodo: string }>(records: T[]): T[] {
  return [...records].sort((a, b) => (a.periodo < b.periodo ? 1 : a.periodo > b.periodo ? -1 : 0));
}

const CifModule: React.FC<CifModuleProps> = ({ activeSection, onSectionChange }) => {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<{ producto?: string; periodo?: string }>({});
  const [totales, setTotales] = useState<CifTotalRecord[]>([]);
  const [unitarios, setUnitarios] = useState<CifUnitarioRecord[]>([]);
  const [recalculos, setRecalculos] = useState<CifRecalculationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [totalForm, setTotalForm] = useState(emptyTotalForm);
  const [unitarioForm, setUnitarioForm] = useState(emptyUnitarioForm);
  const [recalculoForm, setRecalculoForm] = useState(emptyRecalculoForm);
  const [totalStatus, setTotalStatus] = useState<FormStatus>({ state: 'idle', message: null });
  const [unitarioStatus, setUnitarioStatus] = useState<FormStatus>({ state: 'idle', message: null });
  const [recalculoStatus, setRecalculoStatus] = useState<FormStatus>({ state: 'idle', message: null });

  const handleApplyFilters = useCallback(
    (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setAppliedFilters({
        producto: filters.producto.trim() || undefined,
        periodo: toIsoPeriod(filters.periodo),
      });
    },
    [filters],
  );

  useEffect(() => {
    let ignore = false;
    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [totalesResponse, unitariosResponse] = await Promise.all([
          fetchCifTotales(appliedFilters.producto, appliedFilters.periodo),
          fetchCifUnitarios(appliedFilters.producto, appliedFilters.periodo),
        ]);
        if (!ignore) {
          setTotales(sortByPeriodoDesc(totalesResponse));
          setUnitarios(sortByPeriodoDesc(unitariosResponse));
        }
      } catch (error) {
        if (!ignore) {
          setLoadError('No se pudieron obtener los registros de CIF. Intenta nuevamente.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [appliedFilters]);

  const latestTotal = useMemo(() => (totales.length > 0 ? totales[0] : null), [totales]);
  const latestUnitario = useMemo(() => (unitarios.length > 0 ? unitarios[0] : null), [unitarios]);

  const handleTotalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setTotalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUnitarioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUnitarioForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecalculoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setRecalculoForm({ periodo: value });
  };

  const resetStatus = () => {
    setTotalStatus({ state: 'idle', message: null });
    setUnitarioStatus({ state: 'idle', message: null });
    setRecalculoStatus({ state: 'idle', message: null });
  };

  const handleSubmitTotal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    const periodoIso = toIsoPeriod(totalForm.periodo);
    const monto = Number(totalForm.monto);
    const base = Number(totalForm.base);
    if (!totalForm.producto.trim() || !periodoIso || !Number.isFinite(monto) || monto <= 0 || !Number.isFinite(base) || base < 0) {
      setTotalStatus({ state: 'error', message: 'Revisa producto, periodo, monto (>0) y base (>=0).' });
      return;
    }

    const payload: CreateCifTotalPayload = {
      producto: totalForm.producto.trim(),
      periodo: periodoIso,
      monto,
      base,
      accessId: totalForm.accessId.trim() || undefined,
    };

    try {
      setTotalStatus({ state: 'saving', message: 'Guardando CIF total…' });
      const record = await createCifTotal(payload);
      setTotales((prev) => sortByPeriodoDesc([record, ...prev.filter((item) => item.id !== record.id)]));
      setTotalStatus({ state: 'success', message: 'CIF total registrado correctamente.' });
      setTotalForm({ ...emptyTotalForm, producto: totalForm.producto, periodo: totalForm.periodo });
    } catch (error) {
      setTotalStatus({ state: 'error', message: 'No se pudo guardar el CIF total. Verifica duplicados o datos requeridos.' });
    }
  };

  const handleSubmitUnitario = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    const periodoIso = toIsoPeriod(unitarioForm.periodo);
    const cantidad = Number(unitarioForm.cantidad);
    if (!unitarioForm.producto.trim() || !periodoIso || !Number.isFinite(cantidad) || cantidad <= 0) {
      setUnitarioStatus({ state: 'error', message: 'Revisa producto, periodo y cantidad (>0).' });
      return;
    }

    const payload: CreateCifUnitarioPayload = {
      producto: unitarioForm.producto.trim(),
      periodo: periodoIso,
      cantidad,
      accessId: unitarioForm.accessId.trim() || undefined,
    };

    try {
      setUnitarioStatus({ state: 'saving', message: 'Calculando CIF unitario…' });
      const record = await createCifUnitario(payload);
      setUnitarios((prev) => sortByPeriodoDesc([record, ...prev.filter((item) => item.id !== record.id)]));
      setUnitarioStatus({ state: 'success', message: 'CIF unitario calculado correctamente.' });
      setUnitarioForm({ ...emptyUnitarioForm, producto: unitarioForm.producto, periodo: unitarioForm.periodo });
    } catch (error) {
      setUnitarioStatus({
        state: 'error',
        message: 'No se pudo calcular el CIF unitario. Verifica que exista un CIF total y la cantidad sea válida.',
      });
    }
  };

  const handleSubmitRecalculo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetStatus();

    const periodoIso = toIsoPeriod(recalculoForm.periodo);
    if (!periodoIso) {
      setRecalculoStatus({ state: 'error', message: 'Selecciona un periodo para recalcular.' });
      return;
    }

    try {
      setRecalculoStatus({ state: 'saving', message: 'Recalculando CIF…' });
      const response = await recalculateCif({ periodo: periodoIso });
      setRecalculos(sortByPeriodoDesc(response));
      setRecalculoStatus({ state: 'success', message: 'Recalculo completado. Revisa los resultados debajo.' });
    } catch (error) {
      setRecalculoStatus({ state: 'error', message: 'No se pudo recalcular CIF. Revisa el periodo e intenta nuevamente.' });
    }
  };

  return (
    <div className="cif-module">
      <header className="cif-header">
        <div>
          <h1>CIF · Costos indirectos de fabricación</h1>
          <p>
            Registra montos totales, calcula costos unitarios y ejecuta recalculos apoyándote en los filtros de producto y
            periodo.
          </p>
        </div>
        <div className="cif-header__actions">
          <button
            type="button"
            className="cif-header__action"
            data-active={activeSection === 'panel'}
            onClick={() => onSectionChange?.('panel')}
          >
            Panel general
          </button>
          <button
            type="button"
            className="cif-header__action"
            data-active={activeSection === 'totales'}
            onClick={() => onSectionChange?.('totales')}
          >
            Registrar total
          </button>
          <button
            type="button"
            className="cif-header__action"
            data-active={activeSection === 'unitarios'}
            onClick={() => onSectionChange?.('unitarios')}
          >
            Calcular unitario
          </button>
          <button
            type="button"
            className="cif-header__action"
            data-active={activeSection === 'recalculo'}
            onClick={() => onSectionChange?.('recalculo')}
          >
            Recalcular
          </button>
        </div>
      </header>

      <section className="cif-card">
        <h2>Resumen</h2>
        <div className="cif-summary-grid">
          <article className="cif-summary-item">
            <h3>Último CIF total</h3>
            <p className="cif-summary-value">{latestTotal ? formatCurrency(latestTotal.monto) : '—'}</p>
            <dl>
              <div>
                <dt>Producto</dt>
                <dd>{latestTotal?.producto ?? '—'}</dd>
              </div>
              <div>
                <dt>Periodo</dt>
                <dd>{latestTotal ? formatDate(latestTotal.periodo) : '—'}</dd>
              </div>
              <div>
                <dt>Base</dt>
                <dd>{latestTotal ? formatCurrency(latestTotal.base) : '—'}</dd>
              </div>
            </dl>
          </article>
          <article className="cif-summary-item">
            <h3>Costo unitario vigente</h3>
            <p className="cif-summary-value">{latestUnitario ? formatCurrency(latestUnitario.costoUnitario) : '—'}</p>
            <dl>
              <div>
                <dt>Producto</dt>
                <dd>{latestUnitario?.producto ?? '—'}</dd>
              </div>
              <div>
                <dt>Periodo</dt>
                <dd>{latestUnitario ? formatDate(latestUnitario.periodo) : '—'}</dd>
              </div>
              <div>
                <dt>Cantidad</dt>
                <dd>{latestUnitario ? latestUnitario.cantidad.toLocaleString('es-AR') : '—'}</dd>
              </div>
            </dl>
          </article>
          <article className="cif-summary-item">
            <h3>Último recalculo</h3>
            <p className="cif-summary-value">
              {recalculos.length > 0 ? formatDate(recalculos[0].periodo) : 'Sin ejecuciones recientes'}
            </p>
            <p className="cif-summary-note">
              Los resultados del recalculo aparecen en la sección “Recalcular” después de completar el proceso.
            </p>
          </article>
        </div>
      </section>

      <section className="cif-card">
        <form className="cif-filters" onSubmit={handleApplyFilters}>
          <h2>Filtros de consulta</h2>
          <div className="cif-filters__fields">
            <label className="cif-field">
              <span>Producto</span>
              <input
                type="text"
                name="producto"
                value={filters.producto}
                onChange={(event) => setFilters((prev) => ({ ...prev, producto: event.target.value }))}
                placeholder="ID o nombre de producto"
              />
            </label>
            <label className="cif-field">
              <span>Periodo</span>
              <input
                type="month"
                name="periodo"
                value={filters.periodo}
                onChange={(event) => setFilters((prev) => ({ ...prev, periodo: event.target.value }))}
                max="9999-12"
              />
            </label>
          </div>
          <div className="cif-filters__actions">
            <button type="submit" className="primary">Aplicar filtros</button>
            <button
              type="button"
              onClick={() => {
                setFilters(emptyFilters);
                setAppliedFilters({});
              }}
              className="ghost"
            >
              Limpiar
            </button>
          </div>
          {isLoading && <p className="cif-status">Cargando datos…</p>}
          {loadError && <p className="cif-status cif-status--error">{loadError}</p>}
        </form>
      </section>

      <section className="cif-grid">
        <article className="cif-card" data-highlight={activeSection === 'totales'}>
          <header className="cif-card__header">
            <div>
              <h2>Registrar CIF total</h2>
              <p>Captura monto y base del periodo seleccionado.</p>
            </div>
          </header>
          <form className="cif-form" onSubmit={handleSubmitTotal}>
            <label className="cif-field">
              <span>Producto</span>
              <input
                type="text"
                name="producto"
                value={totalForm.producto}
                onChange={handleTotalChange}
                required
              />
            </label>
            <label className="cif-field">
              <span>Periodo</span>
              <input
                type="month"
                name="periodo"
                value={totalForm.periodo}
                onChange={handleTotalChange}
                required
              />
            </label>
            <label className="cif-field">
              <span>Monto total (ARS)</span>
              <input type="number" name="monto" value={totalForm.monto} onChange={handleTotalChange} required min="0" step="0.01" />
            </label>
            <label className="cif-field">
              <span>Base de prorrateo</span>
              <input type="number" name="base" value={totalForm.base} onChange={handleTotalChange} required min="0" step="0.01" />
            </label>
            <label className="cif-field">
              <span>Access ID (opcional)</span>
              <input type="text" name="accessId" value={totalForm.accessId} onChange={handleTotalChange} />
            </label>
            <button type="submit" className="primary" disabled={totalStatus.state === 'saving'}>
              {totalStatus.state === 'saving' ? 'Guardando…' : 'Registrar CIF total'}
            </button>
            {totalStatus.message && (
              <p className={`cif-status ${totalStatus.state === 'error' ? 'cif-status--error' : 'cif-status--success'}`}>
                {totalStatus.message}
              </p>
            )}
          </form>
        </article>

        <article className="cif-card" data-highlight={activeSection === 'unitarios'}>
          <header className="cif-card__header">
            <div>
              <h2>Calcular CIF unitario</h2>
              <p>Utiliza el total registrado para obtener costo por unidad.</p>
            </div>
          </header>
          <form className="cif-form" onSubmit={handleSubmitUnitario}>
            <label className="cif-field">
              <span>Producto</span>
              <input
                type="text"
                name="producto"
                value={unitarioForm.producto}
                onChange={handleUnitarioChange}
                required
              />
            </label>
            <label className="cif-field">
              <span>Periodo</span>
              <input
                type="month"
                name="periodo"
                value={unitarioForm.periodo}
                onChange={handleUnitarioChange}
                required
              />
            </label>
            <label className="cif-field">
              <span>Cantidad producida</span>
              <input
                type="number"
                name="cantidad"
                value={unitarioForm.cantidad}
                onChange={handleUnitarioChange}
                required
                min="0"
                step="0.01"
              />
            </label>
            <label className="cif-field">
              <span>Access ID (opcional)</span>
              <input type="text" name="accessId" value={unitarioForm.accessId} onChange={handleUnitarioChange} />
            </label>
            <button type="submit" className="primary" disabled={unitarioStatus.state === 'saving'}>
              {unitarioStatus.state === 'saving' ? 'Calculando…' : 'Calcular CIF unitario'}
            </button>
            {unitarioStatus.message && (
              <p className={`cif-status ${unitarioStatus.state === 'error' ? 'cif-status--error' : 'cif-status--success'}`}>
                {unitarioStatus.message}
              </p>
            )}
          </form>
        </article>

        <article className="cif-card" data-highlight={activeSection === 'recalculo'}>
          <header className="cif-card__header">
            <div>
              <h2>Recalcular CIF</h2>
              <p>Ejecuta el proceso automático apoyado en costos finales y producción consolidada.</p>
            </div>
          </header>
          <form className="cif-form" onSubmit={handleSubmitRecalculo}>
            <label className="cif-field">
              <span>Periodo</span>
              <input
                type="month"
                name="periodo"
                value={recalculoForm.periodo}
                onChange={handleRecalculoChange}
                required
              />
            </label>
            <button type="submit" className="primary" disabled={recalculoStatus.state === 'saving'}>
              {recalculoStatus.state === 'saving' ? 'Recalculando…' : 'Ejecutar recalculo'}
            </button>
            {recalculoStatus.message && (
              <p className={`cif-status ${recalculoStatus.state === 'error' ? 'cif-status--error' : 'cif-status--success'}`}>
                {recalculoStatus.message}
              </p>
            )}
          </form>
          {recalculos.length > 0 && (
            <div className="cif-table-wrapper">
              <table className="cif-table">
                <caption>Resultados del último recalculo</caption>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Periodo</th>
                    <th>Monto</th>
                    <th>Base</th>
                    <th>Cantidad</th>
                    <th>Costo unitario</th>
                  </tr>
                </thead>
                <tbody>
                  {recalculos.map((item) => (
                    <tr key={`${item.producto}-${item.periodo}-${item.id ?? ''}`}>
                      <td>{item.producto}</td>
                      <td>{formatDate(item.periodo)}</td>
                      <td>{formatCurrency(item.monto)}</td>
                      <td>{formatCurrency(item.base)}</td>
                      <td>{item.cantidad ? item.cantidad.toLocaleString('es-AR') : '—'}</td>
                      <td>{formatCurrency(item.costoUnitario)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      <section className="cif-card" data-highlight={activeSection === 'panel'}>
        <header className="cif-card__header">
          <div>
            <h2>Historial de CIF</h2>
            <p>Consulta registros totales y unitarios aplicando los filtros superiores.</p>
          </div>
        </header>
        <div className="cif-history">
          <div className="cif-table-wrapper">
            <table className="cif-table">
              <caption>CIF total</caption>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Periodo</th>
                  <th>Monto</th>
                  <th>Base</th>
                  <th>Access ID</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {totales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cif-empty">Sin registros para los filtros aplicados.</td>
                  </tr>
                ) : (
                  totales.map((total) => (
                    <tr key={`${total.producto}-${total.periodo}-${total.id ?? ''}`}>
                      <td>{total.producto}</td>
                      <td>{formatDate(total.periodo)}</td>
                      <td>{formatCurrency(total.monto)}</td>
                      <td>{formatCurrency(total.base)}</td>
                      <td>{total.accessId ?? '—'}</td>
                      <td>{formatDate(total.updatedAt ?? total.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="cif-table-wrapper">
            <table className="cif-table">
              <caption>CIF unitario</caption>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Periodo</th>
                  <th>Cantidad</th>
                  <th>Costo unitario</th>
                  <th>Access ID</th>
                  <th>Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {unitarios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cif-empty">Sin registros para los filtros aplicados.</td>
                  </tr>
                ) : (
                  unitarios.map((unitario) => (
                    <tr key={`${unitario.producto}-${unitario.periodo}-${unitario.id ?? ''}`}>
                      <td>{unitario.producto}</td>
                      <td>{formatDate(unitario.periodo)}</td>
                      <td>{unitario.cantidad.toLocaleString('es-AR')}</td>
                      <td>{formatCurrency(unitario.costoUnitario)}</td>
                      <td>{unitario.accessId ?? '—'}</td>
                      <td>{formatDate(unitario.updatedAt ?? unitario.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export type { CifSection };
export default CifModule;
