import React from 'react';
import type { ReportTableDescriptor } from '../types';

interface ReportTableProps<Row extends Record<string, unknown>> {
  descriptor: ReportTableDescriptor<Row>;
}

function isNumericColumn(value: unknown): value is number {
  return typeof value === 'number' || (typeof value === 'string' && /^-?\d+[\d,.]*$/.test(value));
}

const ReportTable = <Row extends Record<string, unknown>>({ descriptor }: ReportTableProps<Row>) => {
  if (!descriptor.rows || descriptor.rows.length === 0) {
    return (
      <div className="reportes-empty-state" role="status" aria-live="polite">
        <h4>Sin datos</h4>
        <p>{descriptor.emptyMessage ?? 'No se encontraron resultados para los filtros seleccionados.'}</p>
      </div>
    );
  }

  return (
    <div className="reportes-table-wrapper">
      <table className="reportes-table" role="grid" aria-label={descriptor.title}>
        <caption className="sr-only">{descriptor.description}</caption>
        <thead>
          <tr>
            {descriptor.columns.map((column) => (
              <th
                key={String(column.id)}
                scope="col"
                className={column.isNumeric ? 'reportes-table__numeric' : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {descriptor.rows.map((row, index) => (
            <tr key={index}>
              {descriptor.columns.map((column) => {
                const value = row[column.id];
                const isNumeric = column.isNumeric ?? isNumericColumn(value);
                return (
                  <td
                    key={String(column.id)}
                    className={isNumeric ? 'reportes-table__numeric' : undefined}
                    data-column={column.label}
                  >
                    {value === undefined || value === null || value === '' ? '—' : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        {descriptor.totalRow && (
          <tfoot>
            <tr>
              {descriptor.columns.map((column, columnIndex) => {
                const value = descriptor.totalRow?.[column.id];
                return (
                  <td
                    key={String(column.id)}
                    className={column.isNumeric ? 'reportes-table__numeric' : undefined}
                  >
                    {columnIndex === 0 && descriptor.totalRow?.label ? descriptor.totalRow.label : value ?? '—'}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default ReportTable;
