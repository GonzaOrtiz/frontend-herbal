import React from 'react';
import { OperacionProvider } from './context/OperacionContext';
import OperacionLayout from './components/OperacionLayout';
import type { OperacionModulo } from './types';

interface OperacionModuleProps {
  initialModulo?: OperacionModulo;
}

const OperacionModule: React.FC<OperacionModuleProps> = ({ initialModulo }) => (
  <OperacionProvider initialModulo={initialModulo}>
    <OperacionLayout />
  </OperacionProvider>
);

export default OperacionModule;
