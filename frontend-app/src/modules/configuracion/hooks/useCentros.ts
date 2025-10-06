import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/http/apiClient';

export function useCentros() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['centros'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/centros');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (centro: any) => {
      const { data } = await apiClient.post('/api/centros', centro);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['centros'] }),
  });

  return { ...query, createMutation };
}
