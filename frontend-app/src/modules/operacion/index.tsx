import React from 'react';
import { OperacionProvider } from './context/OperacionContext';
import OperacionLayout from './components/OperacionLayout';

const OperacionModule: React.FC = () => (
  <OperacionProvider>
    <OperacionLayout />
  </OperacionProvider>
);

export default OperacionModule;
