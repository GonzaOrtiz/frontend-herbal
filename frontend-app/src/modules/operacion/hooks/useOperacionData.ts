import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/query/QueryClient';
import { useOperacionContext } from '../context/OperacionContext';
import type {
  AccionMasivaResultado,
  FiltroPersistente,
  ImportStatus,
  OperacionModulo,
  OperacionRegistro,
} from '../types';
import { dataset } from '../utils/sampleData';
import { emitOperacionEvent } from '../utils/eventBus';

function matchesModuloFilters(registro: OperacionRegistro, modulo: OperacionModulo, filtros: FiltroPersistente) {
  const { calculationDate, producto, centro, lote, turno, rango, actividad, orden } = filtros;
  if (calculationDate && registro.calculationDate !== calculationDate) return false;
  if (centro && registro.centro !== centro) return false;
  if ('producto' in registro && producto && registro.producto !== producto) return false;
  if ('lote' in registro && lote && registro.lote !== lote) return false;
  if ('turno' in registro && turno && registro.turno !== turno) return false;
  if (modulo === 'consumos' && actividad && registro.changeReason !== undefined && !registro.changeReason.includes(actividad)) {
    return false;
  }
  if (modulo === 'producciones' && orden && 'orden' in registro && registro.orden !== orden) {
    return false;
  }
  if (rango) {
    const fecha = new Date(registro.fecha).getTime();
    const desde = new Date(rango.desde).getTime();
    const hasta = new Date(rango.hasta).getTime();
    if (fecha < desde || fecha > hasta) return false;
  }
  return true;
}

function filterRegistros(modulo: OperacionModulo, filtros: FiltroPersistente) {
  const registros = dataset[modulo] ?? [];
  return registros.filter((registro) => matchesModuloFilters(registro, modulo, filtros));
}

export function useOperacionData() {
  const { modulo, filtros } = useOperacionContext();
  const queryClient = useQueryClient();

  const query = useQuery<OperacionRegistro[]>({
    queryKey: ['operacion', modulo, filtros],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return filterRegistros(modulo, filtros);
    },
  });

  const createMutation = useMutation<OperacionRegistro, OperacionRegistro>({
    mutationFn: async (registro) => {
      dataset[modulo] = [...dataset[modulo], registro];
      return registro;
    },
    onSuccess: (registro) => {
      emitOperacionEvent({ type: 'registro:creado', modulo, registro });
      queryClient.setQueryData(['operacion', modulo, filtros], filterRegistros(modulo, filtros));
    },
  });

  const updateMutation = useMutation<OperacionRegistro, OperacionRegistro>({
    mutationFn: async (registroActualizado) => {
      dataset[modulo] = dataset[modulo].map((registro) =>
        registro.id === registroActualizado.id ? { ...registro, ...registroActualizado } : registro
      );
      return registroActualizado;
    },
    onSuccess: (registro) => {
      emitOperacionEvent({ type: 'registro:actualizado', modulo, registro });
      queryClient.setQueryData(['operacion', modulo, filtros], filterRegistros(modulo, filtros));
    },
  });

  const deleteMutation = useMutation<string, string>({
    mutationFn: async (id) => {
      dataset[modulo] = dataset[modulo].filter((registro) => registro.id !== id);
      return id;
    },
    onSuccess: (id) => {
      emitOperacionEvent({ type: 'registro:eliminado', modulo, id });
      queryClient.setQueryData(['operacion', modulo, filtros], filterRegistros(modulo, filtros));
    },
  });

  const runAccionMasiva = (accion: 'aprobar' | 'recalcular' | 'cerrar', ids: string[]): AccionMasivaResultado => {
    let registrosProcesados = 0;
    let impactoExistencias = 0;
    let impactoCostos = 0;

    dataset[modulo] = dataset[modulo].map((registro) => {
      if (!ids.includes(registro.id)) return registro;
      registrosProcesados += 1;
      if ('cantidad' in registro) {
        impactoExistencias += registro.cantidad;
      }
      if ('cantidadProducida' in registro) {
        impactoExistencias += registro.cantidadProducida;
      }
      impactoCostos += 10;
      return { ...registro, syncStatus: accion === 'cerrar' ? 'synced' : 'processing' } as OperacionRegistro;
    });

    const resultado: AccionMasivaResultado = {
      accion,
      registrosProcesados,
      impactoExistencias,
      impactoCostos,
      mensaje: `Acción ${accion} aplicada sobre ${registrosProcesados} registros`,
    };

    emitOperacionEvent({ type: 'importacion:finalizada', modulo, resumen: resultado });
    if (accion === 'cerrar') {
      emitOperacionEvent({ type: 'cierre:solicitado', modulo, payload: { closeReason: 'Cierre manual' } });
    }
    queryClient.setQueryData(['operacion', modulo, filtros], filterRegistros(modulo, filtros));
    return resultado;
  };

  const resumen = useMemo(() => ({
    totalRegistros: query.data?.length ?? 0,
    errores: query.status === 'error',
  }), [query.data, query.status]);

  return {
    query,
    createRegistro: createMutation.mutate,
    updateRegistro: updateMutation.mutate,
    deleteRegistro: deleteMutation.mutate,
    runAccionMasiva,
    resumen,
  };
}

export function useImportacionStatus(modulo: OperacionModulo) {
  const key = ['operacion', modulo, 'import-status'] as const;
  const queryClient = useQueryClient();
  const status = (queryClient.getQuery<ImportStatus>(key)?.data ?? 'idle') as ImportStatus;
  const setStatus = (nuevo: ImportStatus) => {
    queryClient.setQueryData(key, nuevo);
  };
  return { status, setStatus };
}
