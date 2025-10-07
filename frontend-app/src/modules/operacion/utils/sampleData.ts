import type {
  ConsumoRegistro,
  LitrosCremaRegistro,
  OperacionModulo,
  OperacionRegistro,
  PerdidaRegistro,
  ProduccionRegistro,
  SobranteRegistro,
} from '../types';
import { generateOperacionId } from './id';

function nowIso(offsetMinutes = 0) {
  return new Date(Date.now() + offsetMinutes * 60 * 1000).toISOString();
}

const BASE_DATE = new Date().toISOString().slice(0, 10);

const consumos: ConsumoRegistro[] = [
  {
    id: generateOperacionId('consumo'),
    producto: 'Mantequilla premium',
    insumo: 'Crema pasteurizada',
    cantidad: 1250.5,
    unidad: 'kg',
    tipoProd: 'Lácteo',
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    lote: 'L-20240501-A',
    turno: 'M1',
    responsable: 'coordinador.01',
    createdBy: 'coordinador.01',
    createdAt: nowIso(-90),
    updatedBy: 'analista.01',
    updatedAt: nowIso(-60),
    source: 'manual',
    syncStatus: 'synced',
    lastImportedAt: nowIso(-120),
    changeReason: 'Ajuste inicial del turno',
  },
  {
    id: generateOperacionId('consumo'),
    producto: 'Mantequilla premium',
    insumo: 'Sal marina',
    cantidad: 12,
    unidad: 'kg',
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    lote: 'L-20240501-A',
    turno: 'M1',
    responsable: 'coordinador.01',
    createdBy: 'import-bot',
    createdAt: nowIso(-45),
    source: 'import',
    syncStatus: 'processing',
    lastImportedAt: nowIso(-45),
  },
];

const producciones: ProduccionRegistro[] = [
  {
    id: generateOperacionId('produccion'),
    orden: 'ORD-PLANEADA',
    producto: 'Mantequilla premium',
    lote: 'L-20240501-A',
    turno: 'M1',
    cantidadProducida: 1240,
    unidad: 'kg',
    desperdicioPermitido: 50,
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    responsable: 'coordinador.01',
    createdBy: 'coordinador.01',
    createdAt: nowIso(-200),
    source: 'manual',
    syncStatus: 'synced',
    lastImportedAt: nowIso(-200),
  },
];

const litros: LitrosCremaRegistro[] = [
  {
    id: generateOperacionId('litros'),
    lote: 'L-20240501-A',
    turno: 'M1',
    litros: 3100,
    temperatura: 4.1,
    solidosTotales: 38.5,
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    responsable: 'analista.01',
    createdBy: 'analista.01',
    createdAt: nowIso(-160),
    source: 'manual',
    syncStatus: 'synced',
    lastImportedAt: nowIso(-160),
  },
];

const perdidas: PerdidaRegistro[] = [
  {
    id: generateOperacionId('perdida'),
    categoria: 'merma',
    lote: 'L-20240501-A',
    turno: 'M1',
    cantidad: 8.5,
    unidad: 'kg',
    justificacion: 'Limpieza de equipo al cierre del turno nocturno',
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    responsable: 'analista.01',
    createdBy: 'analista.01',
    createdAt: nowIso(-30),
    source: 'manual',
    syncStatus: 'processing',
    lastImportedAt: nowIso(-30),
  },
];

const sobrantes: SobranteRegistro[] = [
  {
    id: generateOperacionId('sobrante'),
    lote: 'L-20240501-A',
    turno: 'M1',
    cantidad: 15,
    unidad: 'kg',
    destino: 'Cámara fría secundaria',
    fecha: BASE_DATE,
    calculationDate: BASE_DATE,
    centro: 'CENTRO-GENERAL',
    responsable: 'analista.02',
    createdBy: 'analista.02',
    createdAt: nowIso(-20),
    source: 'manual',
    syncStatus: 'stale',
    lastImportedAt: nowIso(-20),
  },
];

export const dataset: Record<OperacionModulo, OperacionRegistro[]> = {
  consumos,
  producciones,
  litros,
  perdidas,
  sobrantes,
};
