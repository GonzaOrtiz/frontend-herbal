import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para autenticación y manejo de errores
apiClient.interceptors.request.use((config) => {
  // Agregar lógica para Authorization y x-user
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejo de refresh tokens y logging
    return Promise.reject(error);
  }
);

export default apiClient;
