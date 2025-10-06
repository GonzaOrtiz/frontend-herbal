import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

const CatalogFilterBar: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
    <TextField
      label="Buscar"
      value={value}
      onChange={e => onChange(e.target.value)}
      variant="outlined"
      size="small"
    />
    {/* Agregar más filtros si aplica */}
  </Box>
);

export default CatalogFilterBar;
