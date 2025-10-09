import React from 'react';
import type { BitacoraImportacion } from '../types';

interface Props {
  bitacora: BitacoraImportacion | null;
}

const ImportErrorLog: React.FC<Props> = ({ bitacora }) => {
  if (!bitacora || bitacora.errores.length === 0) {
    return null;
  }

  const descargar = (tipo: 'csv' | 'json') => {
    const nombre = `${bitacora.modulo}-errores.${tipo}`;
    const contenido =
      tipo === 'json'
        ? JSON.stringify(bitacora.errores, null, 2)
        : ['fila,campo,mensaje,usuario,timestamp',
            ...bitacora.errores.map((error) =>
              [error.row, error.field, error.message.replace(/,/g, ';'), error.usuario, error.timestamp].join(',')
            ),
          ].join('\n');

    const blob = new Blob([contenido], { type: tipo === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombre;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="import-error-log">
      <strong>Errores de importación</strong>
      <div>
        <button type="button" className="secondary" onClick={() => descargar('csv')}>
          Descargar CSV
        </button>
        <button type="button" className="secondary" onClick={() => descargar('json')}>
          Descargar JSON
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Fila</th>
            <th>Campo</th>
            <th>Mensaje</th>
            <th>Usuario</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {bitacora.errores.map((error) => (
            <tr key={`${error.row}-${error.field}-${error.timestamp}`}>
              <td>{error.row}</td>
              <td>{error.field}</td>
              <td>{error.message}</td>
              <td>{error.usuario}</td>
              <td>{new Date(error.timestamp).toLocaleString('es-MX')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ImportErrorLog;
