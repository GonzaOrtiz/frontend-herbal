import type { ReactNode } from 'react';
import type { CostosSubModulo } from '../types';

export interface ColumnDefinition {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render?: (value: unknown, record: Record<string, unknown>) => string | number | ReactNode;
}

export interface CostosModuleConfig {
  title: string;
  description: string;
  detailTitle: string;
  columns: ColumnDefinition[];
  emptyState: string;
  actions: Array<{
    id: string;
    label: string;
    intent?: 'primary' | 'secondary';
    disabled?: boolean;
    description?: string;
  }>;
}

export const costosConfigs: Record<Exclude<CostosSubModulo, 'prorrateo'>, CostosModuleConfig> = {
  gastos: {
    title: 'Gastos por centro',
    description:
      'Consulta los gastos operativos clasificados por centro, valida su pertenencia al periodo y revisa balances.',
    detailTitle: 'Detalle de gasto',
    emptyState: 'Aún no se registran gastos para los filtros seleccionados.',
    columns: [
      { key: 'fecha', label: 'Fecha', width: '120px' },
      { key: 'centro', label: 'Centro', width: '100px' },
      { key: 'concepto', label: 'Concepto', width: '220px' },
      { key: 'tipo', label: 'Tipo', width: '160px' },
      { key: 'monto', label: 'Monto', width: '140px', align: 'right' },
      { key: 'esGastoDelPeriodo', label: 'Del periodo', width: '120px', align: 'center' },
      { key: 'accessId', label: 'AccessId', width: '160px' },
    ],
    actions: [
      {
        id: 'registrar',
        label: 'Registrar gasto',
        intent: 'primary',
        disabled: true,
        description: 'Disponible al conectar el formulario de registro con los servicios reales.',
      },
      {
        id: 'carga-masiva',
        label: 'Carga masiva',
        disabled: true,
        description: 'Se habilitará cuando esté lista la carga masiva del backend.',
      },
      {
        id: 'exportar',
        label: 'Exportar',
        disabled: true,
        description: 'La exportación estará disponible en la integración final.',
      },
    ],
  },
  depreciaciones: {
    title: 'Depreciaciones',
    description:
      'Distribuye depreciaciones mensuales por centro y maquinaria, supervisa la vida útil y el valor de uso.',
    detailTitle: 'Detalle de depreciación',
    emptyState: 'No existen depreciaciones registradas para los filtros seleccionados.',
    columns: [
      { key: 'fechaCalculo', label: 'Fecha cálculo', width: '120px' },
      { key: 'centro', label: 'Centro', width: '100px' },
      { key: 'maquina', label: 'Máquina', width: '180px' },
      { key: 'depreMensual', label: 'Depreciación mensual', width: '160px', align: 'right' },
      { key: 'vidaUtil', label: 'Vida útil', width: '120px', align: 'right' },
      { key: 'valorUso', label: 'Valor en uso', width: '140px', align: 'right' },
      { key: 'accessId', label: 'AccessId', width: '160px' },
    ],
    actions: [
      {
        id: 'registrar',
        label: 'Registrar depreciación',
        intent: 'primary',
        disabled: true,
        description: 'Pendiente de habilitar junto con el formulario de depreciaciones.',
      },
      {
        id: 'carga-masiva',
        label: 'Carga masiva',
        disabled: true,
        description: 'Se activará con la sincronización oficial de depreciaciones.',
      },
    ],
  },
  sueldos: {
    title: 'Sueldos y mano de obra',
    description: 'Consulta sueldos registrados y cruza con asignaciones para validar el prorrateo automático.',
    detailTitle: 'Detalle de sueldo',
    emptyState: 'No hay sueldos registrados con los filtros actuales.',
    columns: [
      { key: 'fechaSueldo', label: 'Fecha de sueldo', width: '120px' },
      { key: 'centro', label: 'Centro', width: '100px' },
      { key: 'nroEmpleado', label: 'Empleado', width: '120px' },
      { key: 'sueldoTotal', label: 'Sueldo total', width: '140px', align: 'right' },
      { key: 'esGastoDelPeriodo', label: 'Del periodo', width: '120px', align: 'center' },
      { key: 'accessId', label: 'AccessId', width: '160px' },
    ],
    actions: [
      {
        id: 'registrar',
        label: 'Registrar sueldo',
        intent: 'primary',
        disabled: true,
        description: 'Disponible cuando se integre el formulario de sueldos.',
      },
      {
        id: 'carga-masiva',
        label: 'Carga masiva',
        disabled: true,
        description: 'Se activará con la carga masiva de nóminas.',
      },
      {
        id: 'exportar',
        label: 'Exportar',
        disabled: true,
        description: 'Las exportaciones estarán disponibles en la versión conectada.',
      },
    ],
  },
};
