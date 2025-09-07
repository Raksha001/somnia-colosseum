import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useDuels = () => {
  return useQuery({
    queryKey: ['duels'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/duels`);
      return data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};