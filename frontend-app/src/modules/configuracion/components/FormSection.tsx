import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    {children}
  </Box>
);

export default FormSection;
