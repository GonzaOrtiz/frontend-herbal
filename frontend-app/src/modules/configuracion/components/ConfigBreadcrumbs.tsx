import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';

const ConfigBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      <Link to="/configuracion">Configuración</Link>
      {pathnames.map((value, idx) => {
        const to = `/configuracion/${pathnames.slice(0, idx + 1).join('/')}`;
        const isLast = idx === pathnames.length - 1;
        return isLast ? (
          <Typography color="text.primary" key={to}>{value.charAt(0).toUpperCase() + value.slice(1)}</Typography>
        ) : (
          <Link to={to} key={to}>{value.charAt(0).toUpperCase() + value.slice(1)}</Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default ConfigBreadcrumbs;
