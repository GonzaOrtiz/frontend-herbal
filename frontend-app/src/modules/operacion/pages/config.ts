import type { OperacionModulo, VistaModuloConfig } from '../types';

export const operacionConfigs: Record<OperacionModulo, VistaModuloConfig> = {
  consumos: {
    modulo: 'consumos',
    titulo: 'Consumos diarios',
    descripcion:
      'Registra insumos consumidos por producto y turno, validando rangos contra la producción autorizada.',
    filtrosDisponibles: ['centro', 'producto', 'actividad', 'rango', 'lote', 'turno'],
    agrupaciones: ['lote'],
    columnas: [
      { key: 'producto', label: 'Producto' },
      { key: 'insumo', label: 'Insumo' },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'lote', label: 'Lote' },
      { key: 'turno', label: 'Turno' },
    ],
  },
  producciones: {
    modulo: 'producciones',
    titulo: 'Producción',
    descripcion: 'Controla órdenes de producción y sincroniza existencias y costos tras cada cierre.',
    filtrosDisponibles: ['centro', 'orden', 'rango', 'turno'],
    agrupaciones: ['turno'],
    columnas: [
      { key: 'orden', label: 'Orden' },
      { key: 'producto', label: 'Producto' },
      { key: 'cantidadProducida', label: 'Cantidad', numeric: true },
      { key: 'desperdicioPermitido', label: 'Desperdicio', numeric: true },
      { key: 'lote', label: 'Lote' },
      { key: 'turno', label: 'Turno' },
    ],
  },
  litros: {
    modulo: 'litros',
    titulo: 'Litros de crema',
    descripcion: 'Monitorea litros procesados y parámetros de calidad por lote y turno.',
    filtrosDisponibles: ['centro', 'lote', 'turno'],
    agrupaciones: ['lote'],
    columnas: [
      { key: 'lote', label: 'Lote' },
      { key: 'turno', label: 'Turno' },
      { key: 'litros', label: 'Litros', numeric: true },
      { key: 'temperatura', label: 'Temperatura', numeric: true },
      { key: 'solidosTotales', label: 'Sólidos', numeric: true },
    ],
  },
  perdidas: {
    modulo: 'perdidas',
    titulo: 'Pérdidas',
    descripcion: 'Documenta mermas y rechazos con justificación obligatoria y auditoría completa.',
    filtrosDisponibles: ['centro', 'lote', 'turno'],
    columnas: [
      { key: 'categoria', label: 'Categoría' },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'justificacion', label: 'Justificación' },
      { key: 'fecha', label: 'Fecha' },
    ],
  },
  sobrantes: {
    modulo: 'sobrantes',
    titulo: 'Sobrantes',
    descripcion: 'Registra sobrantes y su destino final para conciliación con existencias.',
    filtrosDisponibles: ['centro', 'lote', 'turno'],
    columnas: [
      { key: 'lote', label: 'Lote' },
      { key: 'turno', label: 'Turno' },
      { key: 'cantidad', label: 'Cantidad', numeric: true },
      { key: 'unidad', label: 'Unidad' },
      { key: 'destino', label: 'Destino' },
      { key: 'fecha', label: 'Fecha' },
    ],
  },
};
