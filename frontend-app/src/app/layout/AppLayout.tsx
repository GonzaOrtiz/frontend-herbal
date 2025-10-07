import React from 'react';
import AppHeader from './AppHeader';
import AppSidebar from './AppSidebar';
import AppContent from './AppContent';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh' }}>
    <AppSidebar />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <AppContent>{children}</AppContent>
    </div>
  </div>
);

export default AppLayout;
