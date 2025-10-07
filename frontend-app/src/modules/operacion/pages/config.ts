import type { OperacionModulo, VistaModuloConfig } from '../types';

export const operacionConfigs: Record<OperacionModulo, VistaModuloConfig> = {
  consumos: {
    modulo: 'consumos',
    titulo: 'Consumos diarios',
    descripcion:
      'Registra insumos consumidos por producto y turno, validando rangos contra la producción autorizada.',
    filtrosDisponibles: ['producto', 'rango'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'insumo', label: 'Insumo' },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'tipoProd', label: 'Tipo' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'calculationDate', label: 'Fecha cálculo' },
    ],
  },
  producciones: {
    modulo: 'producciones',
    titulo: 'Producción',
    descripcion: 'Controla órdenes de producción y sincroniza existencias y costos tras cada cierre.',
    filtrosDisponibles: ['centro', 'rango'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'centro', label: 'Centro' },
      { key: 'etapa', label: 'Etapa' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'calculationDate', label: 'Fecha cálculo' },
    ],
  },
  litros: {
    modulo: 'litros',
    titulo: 'Litros de crema',
    descripcion: 'Monitorea litros procesados y parámetros de calidad por lote y turno.',
    filtrosDisponibles: ['producto'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'litros', label: 'Litros', numeric: true },
      { key: 'fecha', label: 'Fecha' },
      { key: 'calculationDate', label: 'Fecha cálculo' },
    ],
  },
  perdidas: {
    modulo: 'perdidas',
    titulo: 'Pérdidas',
    descripcion: 'Documenta mermas y rechazos con justificación obligatoria y auditoría completa.',
    filtrosDisponibles: ['producto', 'rango'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'grupo', label: 'Grupo' },
      { key: 'horma', label: 'Horma', numeric: true },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'calculationDate', label: 'Fecha cálculo' },
    ],
  },
  sobrantes: {
    modulo: 'sobrantes',
    titulo: 'Sobrantes',
    descripcion: 'Registra sobrantes y su destino final para conciliación con existencias.',
    filtrosDisponibles: ['producto', 'rango'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'grupo', label: 'Grupo' },
      { key: 'horma', label: 'Horma', numeric: true },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'calculationDate', label: 'Fecha cálculo' },
    ],
  },
};
