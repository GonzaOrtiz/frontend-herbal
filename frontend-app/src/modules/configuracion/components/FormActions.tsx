import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const FormActions: React.FC<{ onCancel?: () => void; isSubmitting?: boolean }> = ({ onCancel, isSubmitting }) => (
  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
    <Button type="submit" variant="contained" disabled={isSubmitting}>Guardar</Button>
    {onCancel && <Button variant="outlined" onClick={onCancel}>Cancelar</Button>}
  </Box>
);

export default FormActions;
