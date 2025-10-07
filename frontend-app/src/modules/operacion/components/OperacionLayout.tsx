import React, { useEffect, useMemo, useState } from 'react';
import { consumoSchema, litrosSchema, perdidasSchema, produccionSchema, sobrantesSchema } from '../schemas';
import type { Schema } from '../schemas/baseSchema';
import type { AccionMasivaResultado, OperacionModulo, OperacionRegistro } from '../types';
import { useOperacionContext } from '../context/OperacionContext';
import { useOperacionData } from '../hooks/useOperacionData';
import { useBulkImport } from '../hooks/useBulkImport';
import { useOperacionSync } from '../hooks/useOperacionSync';
import OperacionFilterBar from './OperacionFilterBar';
import ResumenContextualSection from './ResumenContextual';
import OperacionDataGrid from './OperacionDataGrid';
import MassActionsDrawer from './MassActionsDrawer';
import BulkUploadDialog from './BulkUploadDialog';
import ProgressPanel from './ProgressPanel';
import ImportErrorLog from './ImportErrorLog';
import { operacionConfigs } from '../pages/config';
import '../operacion.css';

const schemaMap: Record<OperacionModulo, Schema<OperacionRegistro>> = {
  consumos: consumoSchema as unknown as Schema<OperacionRegistro>,
  producciones: produccionSchema as unknown as Schema<OperacionRegistro>,
  litros: litrosSchema as unknown as Schema<OperacionRegistro>,
  perdidas: perdidasSchema as unknown as Schema<OperacionRegistro>,
  sobrantes: sobrantesSchema as unknown as Schema<OperacionRegistro>,
};

const OperacionLayout: React.FC = () => {
  const { modulo, setResumen, resumen } = useOperacionContext();
  const config = operacionConfigs[modulo];
  const { query, runAccionMasiva, resumen: resumenTabla } = useOperacionData();
  const schema = schemaMap[modulo];
  const { importar, status, bitacora, reset } = useBulkImport(modulo, schema);
  const { lastEvent, desbloquear, forceInvalidate } = useOperacionSync();
  const [selected, setSelected] = useState<string[]>([]);
  const [resultado, setResultado] = useState<AccionMasivaResultado | undefined>();
  const [accionEnProgreso, setAccionEnProgreso] = useState(false);
  const [showMassActions, setShowMassActions] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    if (!query.data || query.data.length === 0) return;
    const first = query.data[0] as OperacionRegistro;
    setResumen({
      centro: first.centro,
      calculationDate: first.calculationDate,
      responsable: first.responsable ?? 'coordinador.01',
    });
  }, [query.data, setResumen]);

  const handleAccion = (accion: 'aprobar' | 'recalcular' | 'cerrar') => {
    void (async () => {
      if (selected.length === 0) return;
      setAccionEnProgreso(true);
      try {
        const resultadoAccion = await runAccionMasiva(accion, selected);
        setResultado(resultadoAccion);
        if (accion === 'cerrar') {
          forceInvalidate();
        }
      } catch (error) {
        setResultado({
          accion,
          registrosProcesados: 0,
          impactoExistencias: 0,
          impactoCostos: 0,
          mensaje: error instanceof Error ? error.message : 'No se pudo ejecutar la acción masiva.',
        });
      } finally {
        setAccionEnProgreso(false);
      }
    })();
  };

  const totalRegistros = useMemo(() => query.data?.length ?? 0, [query.data]);
  const massPanelId = 'operacion-mass-actions-panel';
  const bulkPanelId = 'operacion-bulk-upload-panel';
  const progressPanelId = 'operacion-progress-panel';

  return (
    <div className="operacion-module">
      <header className="operacion-header">
        <h1>Operación diaria</h1>
        <button type="button" onClick={desbloquear} disabled={!resumen?.bloqueado}>
          Desbloquear captura
        </button>
      </header>
      <ResumenContextualSection resumen={resumen} totalRegistros={totalRegistros} lastEvent={lastEvent} />
      <OperacionFilterBar config={config} />
      <OperacionDataGrid
        config={config}
        registros={query.data ?? []}
        onSelect={setSelected}
        loading={query.status === 'loading'}
        error={query.error}
        onRetry={query.refetch}
      />
      <MassActionsDrawer
        selected={selected}
        onRun={handleAccion}
        ultimoResultado={resultado}
        isProcessing={accionEnProgreso}
      />
      <div className="operacion-toolbar">
        <div>
          <strong>Resumen</strong>
          <p>{resumenTabla.totalRegistros} registros · Estado: {query.status}</p>
        </div>
        <div className="operacion-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => setShowMassActions((value) => !value)}
            aria-expanded={showMassActions}
            aria-controls={massPanelId}
          >
            Acciones masivas
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setShowBulkUpload((value) => !value)}
            aria-expanded={showBulkUpload}
            aria-controls={bulkPanelId}
          >
            Carga masiva
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setShowProgress((value) => !value)}
            aria-expanded={showProgress}
            aria-controls={progressPanelId}
          >
            Importación masiva
          </button>
        </div>
        <button type="button" onClick={reset}>
          Reiniciar importación
        </button>
      </div>
      {showBulkUpload && (
        <div id={bulkPanelId}>
          <BulkUploadDialog
            modulo={modulo}
            schema={schema}
            status={status}
            bitacora={bitacora}
            onImport={importar}
            onClose={() => setShowBulkUpload(false)}
          />
        </div>
      )}
      {showProgress && (
        <div id={progressPanelId}>
          <ProgressPanel status={status} bitacora={bitacora} onClose={() => setShowProgress(false)} />
        </div>
      )}
      <ImportErrorLog bitacora={bitacora} />
    </div>
  );
};

export default OperacionLayout;
