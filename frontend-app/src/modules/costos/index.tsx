import React from 'react';
import { CostosProvider } from './context/CostosContext';
import CostosLayout from './components/CostosLayout';
import type { CostosSubModulo } from './types';

interface CostosModuleProps {
  initialSubmodule?: CostosSubModulo;
}

const CostosModule: React.FC<CostosModuleProps> = ({ initialSubmodule }) => (
  <CostosProvider initialSubmodule={initialSubmodule}>
    <CostosLayout />
  </CostosProvider>
);

export default CostosModule;
