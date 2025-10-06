import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface CatalogTableProps {
  rows: any[];
  columns: GridColDef[];
  loading?: boolean;
}

const CatalogTable: React.FC<CatalogTableProps> = ({ rows, columns, loading }) => (
  <DataGrid
    rows={rows}
    columns={columns}
    loading={loading}
    autoHeight
    pageSizeOptions={[10, 25, 50]}
    disableRowSelectionOnClick
  />
);

export default CatalogTable;
