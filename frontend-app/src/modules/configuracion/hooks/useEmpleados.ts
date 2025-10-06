import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../lib/http/apiClient';

export function useEmpleados() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['empleados'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/empleados');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (empleado: any) => {
      const { data } = await apiClient.post('/api/empleados', empleado);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['empleados'] }),
  });

  return { ...query, createMutation };
}
