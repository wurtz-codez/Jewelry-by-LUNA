import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

export const useJewelryQuery = (queryParams = {}, options = {}) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    search = '',
    category = '',
    tag = '',
    minPrice,
    maxPrice
  } = queryParams;

  const queryKey = ['jewelry', page, limit, sort, order, search, category, tag, minPrice, maxPrice];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        sort,
        order,
        ...(search && { search }),
        ...(category && category !== 'all' && { category }),
        ...(tag && tag !== 'all' && { tag }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice })
      });

      const response = await axios.get(`${API_BASE_URL}/jewelry?${params}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache data for 30 minutes
    ...options
  });
};

// Hook for fetching a single jewelry item
export const useJewelryItemQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ['jewelry', id],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/jewelry/${id}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache data for 30 minutes
    ...options,
    enabled: !!id // Only run the query if we have an ID
  });
}; 