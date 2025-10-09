import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TablePagination from '@/components/TablePagination';
import usePagination from '@/lib/usePagination';
import {
  ImportacionesApiError,
  computeTotals,
  createImportLog,
  deleteImportLog,
  getImportLog,
  listImportLogs,
  updateImportLog,
  uploadImport,
} from './api';
import type { ImportacionesSection, ImportLog, ManualLogDraft, TableResult } from './types';
import './importaciones.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB sugeridos por política.

const emptyManualDraft: ManualLogDraft = {
  fileName: '',
  importDate: '',
  recordsProcessed: '',
  durationMs: '',
  errorMessages: '',
  notes: '',
};

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'error';

interface ImportacionesModuleProps {
  activeSection: ImportacionesSection;
  onSectionChange?: (section: ImportacionesSection) => void;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '0 bytes';
  if (bytes === 0) return '0 bytes';
  const units = ['bytes', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

function formatIsoDate(value?: string): string {
  if (!value) return '';
  return value.slice(0, 10);
}

function formatDuration(durationMs?: number): string {
  if (!durationMs || durationMs < 0) return '—';
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
}

function stringifyErrorMessages(messages?: string[]): string {
  if (!messages || messages.length === 0) {
    return '';
  }
  return messages.join('\n');
}

function parseErrorMessages(text: string): string[] | undefined {
  if (!text.trim()) {
    return undefined;
  }
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function getUploadStatusLabel(status: UploadStatus): string {
  switch (status) {
    case 'uploading':
      return 'Analizando archivo';
    case 'processing':
      return 'Procesando tablas';
    case 'completed':
      return 'Importación completada';
    case 'error':
      return 'Error al procesar';
    default:
      return 'Listo para importar';
  }
}

function validateDraft(draft: ManualLogDraft): string[] {
  const errors: string[] = [];
  if (!draft.fileName.trim()) {
    errors.push('El nombre de archivo es requerido.');
  }
  if (!draft.importDate) {
    errors.push('La fecha de importación es obligatoria.');
  }
  if (draft.recordsProcessed.trim() === '') {
    errors.push('Ingresa la cantidad de registros procesados.');
  } else if (!/^\d+$/.test(draft.recordsProcessed.trim())) {
    errors.push('Los registros procesados deben ser un número entero.');
  }
  if (draft.durationMs && !/^\d+$/.test(draft.durationMs.trim())) {
    errors.push('La duración debe ser un número entero en milisegundos.');
  }
  return errors;
}

const ImportacionesModule: React.FC<ImportacionesModuleProps> = ({ activeSection, onSectionChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importDate, setImportDate] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [results, setResults] = useState<TableResult[]>([]);
  const [totalRecords, setTotalRecords] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [history, setHistory] = useState<ImportLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ImportLog | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null);
  const [isCreatingManual, setIsCreatingManual] = useState(false);
  const [manualDraft, setManualDraft] = useState<ManualLogDraft>(emptyManualDraft);

  const orderedResults = useMemo<TableResult[]>(() => {
    return [...results].sort((a, b) => a.table.localeCompare(b.table));
  }, [results]);

  const totals = useMemo(() => computeTotals(results), [results]);

  const resultsPagination = usePagination(orderedResults, {
    initialPageSize: 8,
    pageSizeOptions: [5, 10, 25, 50],
  });

  const historyPagination = usePagination(history, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  const sanitizedSearch = searchTerm.trim();

  const fetchHistory = useCallback(
    async (options: { signal?: AbortSignal; silent?: boolean } = {}) => {
      if (!options.silent) {
        setHistoryLoading(true);
      }
      setHistoryError(null);
      try {
        const data = await listImportLogs(
          {
            search: sanitizedSearch || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
          { signal: options.signal },
        );
        if (options.signal?.aborted) {
          return;
        }
        setHistory(data);
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return;
        }
        setHistoryError('No se pudo cargar el historial de importaciones.');
      } finally {
        if (!options.silent) {
          setHistoryLoading(false);
        }
      }
    },
    [sanitizedSearch, startDate, endDate],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetchHistory({ signal: controller.signal });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fetchHistory]);

  useEffect(() => {
    if (selectedLog) {
      setManualDraft({
        fileName: selectedLog.fileName ?? '',
        importDate: formatIsoDate(selectedLog.importDate),
        recordsProcessed: selectedLog.recordsProcessed?.toString() ?? '',
        durationMs: selectedLog.durationMs?.toString() ?? '',
        errorMessages: stringifyErrorMessages(selectedLog.errorMessages),
        notes: selectedLog.notes ?? '',
      });
      setIsCreatingManual(false);
    }
  }, [selectedLog]);

  const resetManualDraft = useCallback(() => {
    setManualDraft(emptyManualDraft);
    setDetailError(null);
    setDetailSuccess(null);
  }, []);

  const handleFileSelection = useCallback((file: File | null) => {
    setFormErrors([]);
    setUploadMessage(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.mdb')) {
      setFormErrors(['Selecciona un archivo con extensión .mdb.']);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormErrors([`El archivo supera el tamaño máximo permitido (${formatBytes(MAX_FILE_SIZE)}).`]);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const [file] = event.dataTransfer.files;
      handleFileSelection(file ?? null);
      event.dataTransfer.clearData();
    }
  };

  const handleFileInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const { files } = event.target;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleImportSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const errors: string[] = [];
    setUploadMessage(null);

    if (!selectedFile) {
      errors.push('Selecciona un archivo Access (.mdb).');
    }
    if (!importDate) {
      errors.push('Define la fecha de importación.');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setUploadStatus('uploading');
    setUploadProgress(20);

    try {
      const response = await uploadImport({
        file: selectedFile as File,
        fechaImportacion: importDate,
      });

      setUploadStatus('processing');
      setUploadProgress(70);

      const payloadResults = Array.isArray(response.results) ? response.results : [];
      setResults(payloadResults);
      setTotalRecords(
        typeof response.totalRecords === 'number' && Number.isFinite(response.totalRecords)
          ? response.totalRecords
          : null,
      );

      setUploadStatus('completed');
      setUploadProgress(100);
      setUploadMessage('Importación completada exitosamente.');
      setSelectedFile(null);

      fetchHistory({ silent: false });
    } catch (error) {
      setUploadStatus('error');
      if (error instanceof ImportacionesApiError && error.status === 409) {
        setUploadMessage('Ya se realizó una importación para la fecha seleccionada. Revisa el historial.');
      } else {
        setUploadMessage('No fue posible procesar la importación. Intenta nuevamente.');
      }
    }
  };

  const handleSelectLog = async (log: ImportLog) => {
    setSelectedLogId(log._id);
    setDetailError(null);
    setDetailSuccess(null);
    setIsCreatingManual(false);
    setDetailLoading(true);
    try {
      const fetched = await getImportLog(log._id);
      setSelectedLog(fetched);
      onSectionChange?.('historial');
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }
      setDetailError('No fue posible obtener el detalle de la bitácora.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateManual = () => {
    setSelectedLogId(null);
    setSelectedLog(null);
    setIsCreatingManual(true);
    resetManualDraft();
    onSectionChange?.('historial');
  };

  const handleManualDraftChange = (field: keyof ManualLogDraft, value: string) => {
    setManualDraft((current) => ({ ...current, [field]: value }));
  };

  const parseDraftPayload = (draft: ManualLogDraft) => {
    const payload = {
      fileName: draft.fileName.trim(),
      importDate: draft.importDate,
      recordsProcessed: Number.parseInt(draft.recordsProcessed.trim(), 10),
      durationMs: draft.durationMs.trim() ? Number.parseInt(draft.durationMs.trim(), 10) : undefined,
      errorMessages: parseErrorMessages(draft.errorMessages) ?? [],
      notes: draft.notes.trim() ? draft.notes.trim() : undefined,
    };
    return payload;
  };

  const handleSubmitManual: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setDetailError(null);
    setDetailSuccess(null);

    const validationErrors = validateDraft(manualDraft);
    if (validationErrors.length > 0) {
      setDetailError(validationErrors.join(' '));
      return;
    }

    const payload = parseDraftPayload(manualDraft);

    try {
      setDetailLoading(true);
      if (isCreatingManual) {
        const created = await createImportLog(payload);
        setDetailSuccess('Bitácora creada correctamente.');
        setIsCreatingManual(false);
        setSelectedLog(created);
        setSelectedLogId(created._id);
      } else if (selectedLog) {
        const original = {
          fileName: selectedLog.fileName,
          importDate: formatIsoDate(selectedLog.importDate),
          recordsProcessed: selectedLog.recordsProcessed,
          durationMs: selectedLog.durationMs,
          errorMessages: stringifyErrorMessages(selectedLog.errorMessages),
          notes: selectedLog.notes ?? '',
        };

        const updates: Record<string, unknown> = {};

        if (payload.fileName !== original.fileName) {
          updates.fileName = payload.fileName;
        }
        if (payload.importDate !== original.importDate) {
          updates.importDate = payload.importDate;
        }
        if (payload.recordsProcessed !== original.recordsProcessed) {
          updates.recordsProcessed = payload.recordsProcessed;
        }
        if (payload.durationMs !== (original.durationMs ?? undefined)) {
          updates.durationMs = payload.durationMs;
        }
        if (manualDraft.errorMessages.trim() !== original.errorMessages.trim()) {
          updates.errorMessages = payload.errorMessages;
        }
        if ((payload.notes ?? '') !== original.notes.trim()) {
          updates.notes = payload.notes;
        }

        if (Object.keys(updates).length === 0) {
          setDetailError('Realiza un cambio antes de guardar la bitácora.');
          return;
        }

        const updated = await updateImportLog(selectedLog._id, updates);
        setSelectedLog(updated);
        setDetailSuccess('Cambios guardados correctamente.');
      }

      fetchHistory({ silent: true });
    } catch (error) {
      if (error instanceof ImportacionesApiError && error.payload) {
        setDetailError('El servidor rechazó la operación. Verifica la información.');
      } else {
        setDetailError('No fue posible guardar la bitácora.');
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la bitácora "${selectedLog.fileName}" del ${formatIsoDate(selectedLog.importDate)}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDetailLoading(true);
      await deleteImportLog(selectedLog._id);
      setSelectedLog(null);
      setSelectedLogId(null);
      setIsCreatingManual(false);
      resetManualDraft();
      setDetailSuccess('Registro eliminado correctamente.');
      fetchHistory({ silent: false });
    } catch (error) {
      setDetailError('No fue posible eliminar la bitácora.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="importaciones-module" data-section={activeSection}>
      <div className="importaciones-grid">
        <section className="importaciones-card">
          <header className="importaciones-card__header">
            <div>
              <p className="importaciones-card__eyebrow">Carga de archivo MDB</p>
              <h2 className="importaciones-card__title">Importar información</h2>
            </div>
            <span className={`importaciones-status importaciones-status--${uploadStatus}`}>
              {getUploadStatusLabel(uploadStatus)}
            </span>
          </header>

          <form className="importaciones-form" onSubmit={handleImportSubmit} noValidate>
            <div
              className="importaciones-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              data-has-file={Boolean(selectedFile)}
            >
              <input
                id="mdb-file"
                type="file"
                accept=".mdb"
                onChange={handleFileInputChange}
                className="importaciones-dropzone__input"
              />
              <div className="importaciones-dropzone__content">
                <p className="importaciones-dropzone__headline">Arrastra y suelta el archivo .mdb aquí</p>
                <p className="importaciones-dropzone__help">o haz clic para seleccionar desde tu dispositivo</p>
                {selectedFile ? (
                  <p className="importaciones-dropzone__file">{`${selectedFile.name} · ${formatBytes(selectedFile.size)}`}</p>
                ) : (
                  <p className="importaciones-dropzone__hint">Tamaño sugerido menor a {formatBytes(MAX_FILE_SIZE)}</p>
                )}
              </div>
            </div>

            <div className="importaciones-form__fields">
              <label className="importaciones-field">
                <span>Fecha de importación</span>
                <input
                  type="date"
                  value={importDate}
                  onChange={(event) => setImportDate(event.target.value)}
                  required
                />
              </label>

              <button
                type="submit"
                className="importaciones-button"
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
              >
                Procesar archivo
              </button>
            </div>

            {formErrors.length > 0 && (
              <ul className="importaciones-alert importaciones-alert--error">
                {formErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            )}

            {uploadMessage && (
              <p
                className={`importaciones-alert ${uploadStatus === 'error' ? 'importaciones-alert--error' : 'importaciones-alert--success'}`}
              >
                {uploadMessage}
              </p>
            )}
          </form>
        </section>

        <section className="importaciones-card importaciones-card--progress">
          <header className="importaciones-card__header">
            <div>
              <p className="importaciones-card__eyebrow">Seguimiento</p>
              <h2 className="importaciones-card__title">Estado del procesamiento</h2>
            </div>
          </header>

          <div className="importaciones-progress">
            <div className="importaciones-progress__bar" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin={0} aria-valuemax={100}>
              <div className="importaciones-progress__indicator" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="importaciones-progress__message">{getUploadStatusLabel(uploadStatus)}</p>
            {totalRecords !== null && (
              <p className="importaciones-progress__totals">Total de registros procesados: {totalRecords}</p>
            )}
          </div>

          {orderedResults.length > 0 && (
            <div className="importaciones-results">
              <header className="importaciones-results__header">
                <h3>Resumen de tablas</h3>
                <p>
                  Insertados: <strong>{totals.inserted}</strong> · Tablas con errores: <strong>{totals.errors}</strong>
                </p>
              </header>
              <div className="importaciones-results__table-wrapper">
                <div className="table-container">
                  <table className="importaciones-table">
                    <thead>
                      <tr>
                        <th>Tabla Access</th>
                        <th>Colección destino</th>
                        <th>Insertados</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsPagination.items.map((result) => (
                        <tr key={result.table}>
                          <td>{result.table}</td>
                          <td>{result.collection}</td>
                          <td>{result.inserted}</td>
                          <td>
                            {result.error ? (
                              <span className="importaciones-badge importaciones-badge--error">{result.error}</span>
                            ) : (
                              <span className="importaciones-badge importaciones-badge--success">Sin errores</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <TablePagination
                page={resultsPagination.page}
                totalPages={resultsPagination.totalPages}
                from={resultsPagination.from}
                to={resultsPagination.to}
                totalItems={resultsPagination.totalItems}
                pageSize={resultsPagination.pageSize}
                pageSizeOptions={resultsPagination.pageSizeOptions}
                onPageChange={resultsPagination.setPage}
                onPageSizeChange={resultsPagination.setPageSize}
                label="Paginación del resumen de tablas"
              />
            </div>
          )}
        </section>
      </div>

      <section className="importaciones-card importaciones-card--history">
        <header className="importaciones-card__header">
          <div>
            <p className="importaciones-card__eyebrow">Bitácoras</p>
            <h2 className="importaciones-card__title">Historial de importaciones</h2>
          </div>
          <button type="button" className="importaciones-button" onClick={handleCreateManual}>
            Nueva bitácora manual
          </button>
        </header>

        <div className="importaciones-history">
          <div className="importaciones-history__list">
            <div className="importaciones-history__filters">
              <input
                type="search"
                placeholder="Buscar por nombre de archivo"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                aria-label="Fecha inicial"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                aria-label="Fecha final"
              />
              <button
                type="button"
                className="importaciones-button importaciones-button--ghost"
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Limpiar filtros
              </button>
            </div>

            {historyError && <p className="importaciones-alert importaciones-alert--error">{historyError}</p>}

            <div className="importaciones-history__table-wrapper">
              <div className="table-container">
                <table className="importaciones-table importaciones-table--selectable">
                  <thead>
                    <tr>
                      <th>Archivo</th>
                      <th>Fecha</th>
                      <th>Procesados</th>
                      <th>Duración</th>
                      <th>Errores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan={5}>Cargando historial…</td>
                      </tr>
                    ) : history.length === 0 ? (
                      <tr>
                        <td colSpan={5}>Sin registros disponibles para los filtros seleccionados.</td>
                      </tr>
                    ) : (
                      historyPagination.items.map((log) => {
                        const errorCount = log.totalErrors ?? log.errorMessages?.length ?? 0;
                        return (
                          <tr
                            key={log._id}
                            data-selected={selectedLogId === log._id}
                            onClick={() => handleSelectLog(log)}
                          >
                            <td>{log.fileName}</td>
                            <td>{formatDate(log.importDate)}</td>
                            <td>{log.recordsProcessed}</td>
                            <td>{formatDuration(log.durationMs)}</td>
                            <td>{errorCount}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {!historyLoading && history.length > 0 && (
              <TablePagination
                page={historyPagination.page}
                totalPages={historyPagination.totalPages}
                from={historyPagination.from}
                to={historyPagination.to}
                totalItems={historyPagination.totalItems}
                pageSize={historyPagination.pageSize}
                pageSizeOptions={historyPagination.pageSizeOptions}
                onPageChange={historyPagination.setPage}
                onPageSizeChange={historyPagination.setPageSize}
                label="Paginación del historial de importaciones"
              />
            )}
          </div>

          <aside className="importaciones-history__detail" aria-live="polite">
            {detailLoading && <p className="importaciones-detail__loading">Cargando detalle…</p>}

            {!detailLoading && isCreatingManual && (
              <div className="importaciones-detail">
                <h3>Nueva bitácora manual</h3>
                <p>Completa los campos para registrar una bitácora manual asociada a la importación.</p>
                <form className="importaciones-detail__form" onSubmit={handleSubmitManual}>
                  <label>
                    <span>Nombre de archivo</span>
                    <input
                      type="text"
                      value={manualDraft.fileName}
                      onChange={(event) => handleManualDraftChange('fileName', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Fecha de importación</span>
                    <input
                      type="date"
                      value={manualDraft.importDate}
                      onChange={(event) => handleManualDraftChange('importDate', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Registros procesados</span>
                    <input
                      type="number"
                      min={0}
                      value={manualDraft.recordsProcessed}
                      onChange={(event) => handleManualDraftChange('recordsProcessed', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Duración (ms)</span>
                    <input
                      type="number"
                      min={0}
                      value={manualDraft.durationMs}
                      onChange={(event) => handleManualDraftChange('durationMs', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Errores</span>
                    <textarea
                      rows={3}
                      placeholder="Escribe un error por línea"
                      value={manualDraft.errorMessages}
                      onChange={(event) => handleManualDraftChange('errorMessages', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Notas</span>
                    <textarea
                      rows={3}
                      value={manualDraft.notes}
                      onChange={(event) => handleManualDraftChange('notes', event.target.value)}
                    />
                  </label>

                  {detailError && <p className="importaciones-alert importaciones-alert--error">{detailError}</p>}
                  {detailSuccess && <p className="importaciones-alert importaciones-alert--success">{detailSuccess}</p>}

                  <div className="importaciones-detail__actions">
                    <button type="submit" className="importaciones-button" disabled={detailLoading}>
                      Guardar bitácora
                    </button>
                    <button
                      type="button"
                      className="importaciones-button importaciones-button--ghost"
                      onClick={() => {
                        setIsCreatingManual(false);
                        resetManualDraft();
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!detailLoading && !isCreatingManual && selectedLog && (
              <div className="importaciones-detail">
                <h3>Detalle de bitácora</h3>
                <dl className="importaciones-detail__metadata">
                  <div>
                    <dt>Archivo</dt>
                    <dd>{selectedLog.fileName}</dd>
                  </div>
                  <div>
                    <dt>Fecha de importación</dt>
                    <dd>{formatDate(selectedLog.importDate)}</dd>
                  </div>
                  <div>
                    <dt>Registros procesados</dt>
                    <dd>{selectedLog.recordsProcessed}</dd>
                  </div>
                  <div>
                    <dt>Duración</dt>
                    <dd>{formatDuration(selectedLog.durationMs)}</dd>
                  </div>
                  <div>
                    <dt>Creado por</dt>
                    <dd>{selectedLog.createdBy ?? 'Sistema'}</dd>
                  </div>
                  <div>
                    <dt>Actualizado</dt>
                    <dd>{selectedLog.updatedAt ? formatDate(selectedLog.updatedAt) : '—'}</dd>
                  </div>
                </dl>

                <form className="importaciones-detail__form" onSubmit={handleSubmitManual}>
                  <label>
                    <span>Nombre de archivo</span>
                    <input
                      type="text"
                      value={manualDraft.fileName}
                      onChange={(event) => handleManualDraftChange('fileName', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Fecha de importación</span>
                    <input
                      type="date"
                      value={manualDraft.importDate}
                      onChange={(event) => handleManualDraftChange('importDate', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Registros procesados</span>
                    <input
                      type="number"
                      min={0}
                      value={manualDraft.recordsProcessed}
                      onChange={(event) => handleManualDraftChange('recordsProcessed', event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Duración (ms)</span>
                    <input
                      type="number"
                      min={0}
                      value={manualDraft.durationMs}
                      onChange={(event) => handleManualDraftChange('durationMs', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Errores</span>
                    <textarea
                      rows={3}
                      placeholder="Escribe un error por línea"
                      value={manualDraft.errorMessages}
                      onChange={(event) => handleManualDraftChange('errorMessages', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Notas</span>
                    <textarea
                      rows={3}
                      value={manualDraft.notes}
                      onChange={(event) => handleManualDraftChange('notes', event.target.value)}
                    />
                  </label>

                  {detailError && <p className="importaciones-alert importaciones-alert--error">{detailError}</p>}
                  {detailSuccess && <p className="importaciones-alert importaciones-alert--success">{detailSuccess}</p>}

                  <div className="importaciones-detail__actions">
                    <button type="submit" className="importaciones-button" disabled={detailLoading}>
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      className="importaciones-button importaciones-button--danger"
                      onClick={handleDeleteLog}
                      disabled={detailLoading}
                    >
                      Eliminar registro
                    </button>
                  </div>
                </form>

                {selectedLog.results && selectedLog.results.length > 0 && (
                  <div className="importaciones-detail__results">
                    <h4>Resultados asociados</h4>
                    <ul>
                      {selectedLog.results.map((result) => (
                        <li key={result.table}>
                          <strong>{result.table}</strong> → {result.collection} · {result.inserted} registros
                          {result.error && <span className="importaciones-badge importaciones-badge--error">{result.error}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!detailLoading && !isCreatingManual && !selectedLog && (
              <div className="importaciones-detail importaciones-detail--empty">
                <h3>Selecciona una bitácora</h3>
                <p>Elige un elemento del listado para revisar su detalle o crea una nueva bitácora manual.</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
};

export default ImportacionesModule;
