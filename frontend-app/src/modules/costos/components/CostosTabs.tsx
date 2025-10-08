import React from 'react';
import { useCostosContext } from '../context/CostosContext';
import type { CostosSubModulo } from '../types';

const tabLabels: Record<CostosSubModulo, string> = {
  gastos: 'Gastos',
  depreciaciones: 'Depreciaciones',
  sueldos: 'Sueldos',
  prorrateo: 'Prorrateo automático',
};

const CostosTabs: React.FC = () => {
  const { submodule, setSubmodule } = useCostosContext();

  const handleSelect = (target: CostosSubModulo) => {
    setSubmodule(target);
  };

  return (
    <div className="costos-tabs" role="tablist" aria-label="Submódulos de costos">
      {(Object.keys(tabLabels) as CostosSubModulo[]).map((tab) => (
        <button
          key={tab}
          type="button"
          className="costos-tab"
          data-active={tab === submodule}
          role="tab"
          aria-selected={tab === submodule}
          onClick={() => handleSelect(tab)}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
};

export default CostosTabs;
