import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AppContent from './AppContent';
import Box from '@mui/material/Box';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ display: 'flex', minHeight: '100vh' }}>
    <AppSidebar />
    <Box sx={{ flex: 1, flexDirection: 'column', display: 'flex' }}>
      <AppHeader />
      <AppContent>{children}</AppContent>
    </Box>
  </Box>
);

export default AppLayout;
