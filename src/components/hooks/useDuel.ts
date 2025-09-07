import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useDuel = (duelId: number) => {
  return useQuery({
    queryKey: ['duel', duelId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/duels/${duelId}`);
      return data.data;
    },
    enabled: !!duelId,
    refetchInterval: 10000, // Refetch every 10 seconds for live data
  });
};