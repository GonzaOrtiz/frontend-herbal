import React from 'react';
import type { ReportTableDescriptor } from '../types';

interface ReportTableProps<Row extends Record<string, unknown>> {
  descriptor: ReportTableDescriptor<Row>;
}

function isNumericColumn(value: unknown): value is number {
  return typeof value === 'number' || (typeof value === 'string' && /^-?\d+[\d,.]*$/.test(value));
}

function formatCellValue(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '—';
  }

  return String(value);
}

const ReportTable = <Row extends Record<string, unknown>>({ descriptor }: ReportTableProps<Row>) => {
  const hasRows = descriptor.rows && descriptor.rows.length > 0;
  const titleId = `${descriptor.id}-title`;
  const descriptionId = descriptor.description ? `${descriptor.id}-description` : undefined;

  if (!hasRows) {
    return (
      <section
        className="reportes-table-card reportes-table-card--empty"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <header className="reportes-table-card__header">
          <h4 id={titleId}>{descriptor.title}</h4>
          {descriptor.description && <p id={descriptionId}>{descriptor.description}</p>}
        </header>
        <div className="reportes-table-card__body">
          <div className="reportes-empty-state" role="status" aria-live="polite">
            <h4>Sin datos</h4>
            <p>{descriptor.emptyMessage ?? 'No se encontraron resultados para los filtros seleccionados.'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reportes-table-card" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <header className="reportes-table-card__header">
        <h4 id={titleId}>{descriptor.title}</h4>
        {descriptor.description && <p id={descriptionId}>{descriptor.description}</p>}
      </header>
      <div className="reportes-table-card__body">
        <div className="reportes-table-wrapper">
          <table
            className="reportes-table"
            role="grid"
            aria-label={descriptor.title}
            aria-describedby={descriptionId}
          >
            {descriptor.description && <caption className="sr-only">{descriptor.description}</caption>}
            <thead>
              <tr>
                {descriptor.columns.map((column) => {
                  const align = column.align ?? (column.isNumeric ? 'right' : 'left');
                  return (
                    <th key={String(column.id)} scope="col" style={{ textAlign: align }}>
                      {column.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {descriptor.rows.map((row, index) => (
                <tr key={index}>
                  {descriptor.columns.map((column) => {
                    const value = row[column.id];
                    const isNumeric = column.isNumeric ?? isNumericColumn(value);
                    const align = column.align ?? (isNumeric ? 'right' : 'left');

                    return (
                      <td
                        key={String(column.id)}
                        className="reportes-table__cell"
                        data-column={column.label}
                        style={{ textAlign: align }}
                      >
                        {formatCellValue(value)}
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
                    const align = column.align ?? (column.isNumeric ? 'right' : 'left');
                    const displayValue =
                      columnIndex === 0 && descriptor.totalRow?.label
                        ? descriptor.totalRow.label
                        : formatCellValue(value);

                    return (
                      <td
                        key={String(column.id)}
                        className="reportes-table__cell"
                        style={{ textAlign: align }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </section>
  );
};

export default ReportTable;
