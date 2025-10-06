import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/http/apiClient';

export function useActividades() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['actividades'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/actividades');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (actividad: any) => {
      const { data } = await apiClient.post('/api/actividades', actividad);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries(['actividades']),
  });

  // update, delete, etc. pueden agregarse igual

  return { ...query, createMutation };
}
