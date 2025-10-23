import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@/lib/query/QueryClient';
import { useOperacionContext } from '../context/OperacionContext';
import {
  createOperacionRegistro,
  deleteOperacionRegistro,
  fetchOperacionRegistros,
  runAccionMasivaRemota,
  updateOperacionRegistro,
} from '../api';
import type {
  AccionMasivaResultado,
  ImportStatus,
  OperacionModulo,
  OperacionRegistro,
} from '../types';
import { emitOperacionEvent } from '../utils/eventBus';
import { filterOperacionRegistros } from '../utils/filterRegistros';

export function useOperacionData() {
  const { modulo, filtros } = useOperacionContext();
  const queryClient = useQueryClient();
  const query = useQuery<OperacionRegistro[]>({
    queryKey: ['operacion', modulo],
    queryFn: async () => {
      return fetchOperacionRegistros(modulo, filtros);
    },
  });

  const registros = useMemo(
    () => filterOperacionRegistros(query.data, modulo, filtros),
    [query.data, modulo, filtros],
  );

  const createMutation = useMutation<OperacionRegistro, OperacionRegistro>({
    mutationFn: async (registro) => {
      const creado = await createOperacionRegistro(modulo, registro, registro.responsable);
      return creado;
    },
    onSuccess: (registro) => {
      emitOperacionEvent({ type: 'registro:creado', modulo, registro });
      queryClient.invalidateQueries(['operacion', modulo]);
    },
  });

  const updateMutation = useMutation<OperacionRegistro, OperacionRegistro>({
    mutationFn: async (registroActualizado) => {
      const actualizado = await updateOperacionRegistro(modulo, registroActualizado, registroActualizado.responsable);
      return actualizado;
    },
    onSuccess: (registro) => {
      emitOperacionEvent({ type: 'registro:actualizado', modulo, registro });
      queryClient.invalidateQueries(['operacion', modulo]);
    },
  });

  const deleteMutation = useMutation<string, string>({
    mutationFn: async (id) => {
      await deleteOperacionRegistro(modulo, id);
      return id;
    },
    onSuccess: (id) => {
      emitOperacionEvent({ type: 'registro:eliminado', modulo, id });
      queryClient.invalidateQueries(['operacion', modulo]);
    },
  });

  const runAccionMasiva = useCallback(
    async (accion: 'aprobar' | 'recalcular' | 'cerrar', ids: string[]): Promise<AccionMasivaResultado> => {
      const resultado = await runAccionMasivaRemota(modulo, accion, ids);
      emitOperacionEvent({ type: 'importacion:finalizada', modulo, resumen: resultado });
      if (accion === 'cerrar') {
        emitOperacionEvent({ type: 'cierre:solicitado', modulo, payload: { closeReason: resultado.mensaje } });
      }
      queryClient.invalidateQueries(['operacion', modulo]);
      return resultado;
    },
    [modulo, queryClient],
  );

  const resumen = useMemo(
    () => ({
      totalRegistros: registros.length,
      errores: query.status === 'error',
    }),
    [registros.length, query.status],
  );

  return {
    query,
    registros,
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
