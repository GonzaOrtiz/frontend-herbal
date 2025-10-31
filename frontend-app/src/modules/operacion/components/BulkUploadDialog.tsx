import React, { useMemo, useState } from 'react';
import type { Schema } from '../schemas/baseSchema';
import type {
  BitacoraImportacion,
  ImportStatus,
  OperacionModulo,
  OperacionRegistro,
} from '../types';

interface Props {
  modulo: OperacionModulo;
  schema: Schema<OperacionRegistro>;
  status: ImportStatus;
  bitacora: BitacoraImportacion | null;
  onImport: (payload: { rows: Record<string, unknown>[]; usuario: string; archivo?: string }) => Promise<
    | { success: true; registros: OperacionRegistro[] }
    | { success: false; errores: unknown }
  >;
  onClose?: () => void;
}

const BulkUploadDialog: React.FC<Props> = ({ modulo, schema, status, bitacora, onImport, onClose }) => {
  const [rawInput, setRawInput] = useState('');
  const [usuario, setUsuario] = useState('analista.01');
  const [mensaje, setMensaje] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!rawInput.trim()) return [];
    try {
      const parsed = JSON.parse(rawInput);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, 5);
      }
      return [];
    } catch (error) {
      return [];
    }
  }, [rawInput]);

  const handleImport = async () => {
    try {
      const rows = JSON.parse(rawInput);
      if (!Array.isArray(rows)) {
        setMensaje('El contenido debe ser un arreglo de objetos.');
        return;
      }
      const result = await onImport({ rows, usuario, archivo: `${modulo}-${Date.now()}.json` });
      if ('success' in result && result.success) {
        setMensaje(`Se importaron ${result.registros.length} registros.`);
      } else {
        setMensaje('La importación registró errores. Revisa la bitácora.');
      }
    } catch (error) {
      setMensaje('No se pudo leer el contenido proporcionado. Verifica el formato JSON.');
    }
  };

  return (
    <section aria-label="Carga masiva" className="progress-panel">
      <header className="operacion-panel-header">
        <div>
          <strong>Carga masiva para {modulo}</strong>
          <p>Los esquemas validan campos clave descritos en la documentación de importaciones.</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="operacion-panel-close"
            onClick={onClose}
            aria-label="Cerrar carga masiva"
          >
            ×
          </button>
        )}
      </header>
      <label>
        Usuario responsable
        <input value={usuario} onChange={(event) => setUsuario(event.target.value)} />
      </label>
      <label>
        Pega el contenido JSON (puede provenir de un CSV transformado)
        <textarea
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          rows={6}
          placeholder='[ { "producto": "Mantequilla premium", ... } ]'
        />
      </label>
      <button
        type="button"
        className="primary"
        onClick={handleImport}
        disabled={!rawInput.trim() || status === 'processing'}
      >
        Validar e importar
      </button>
      {mensaje && <p>{mensaje}</p>}
      {preview.length > 0 && (
        <details>
          <summary>Vista previa de las primeras filas</summary>
          <pre>{JSON.stringify(preview, null, 2)}</pre>
        </details>
      )}
      <footer>
        <small>Campos requeridos: {schema.fields.filter((field) => field.required).map((field) => field.label).join(', ')}.</small>
        {bitacora?.resumeToken && <small>Token de reintento: {bitacora.resumeToken}</small>}
      </footer>
    </section>
  );
};

export default BulkUploadDialog;
