import React from 'react';
import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const navItems = [
  { path: 'actividades', label: 'Actividades' },
  { path: 'empleados', label: 'Empleados' },
  { path: 'centros', label: 'Centros' },
  // Agregar más según catálogos
];

const ConfigNavBar: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
    {navItems.map(item => (
      <Button
        key={item.path}
        component={NavLink}
        to={item.path}
        variant="outlined"
        sx={{ '&.active': { bgcolor: 'primary.light', color: 'primary.contrastText' } }}
      >
        {item.label}
      </Button>
    ))}
  </Box>
);

export default ConfigNavBar;
