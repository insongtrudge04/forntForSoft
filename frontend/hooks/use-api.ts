import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { api, authApi } from '@/lib/api';

export function useApiQuery<T>(
  key: string[],
  path: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => api.get<T>(path),
    ...options,
  });
}

export function useApiMutation<TData, TBody = unknown>(
  method: 'post' | 'patch' | 'delete',
  path: string,
  options?: Omit<UseMutationOptions<TData, Error, TBody>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TBody>({
    mutationFn: (body) => {
      if (method === 'delete') return api.delete<TData>(path);
      return (api[method] as (path: string, body?: TBody) => Promise<TData>)(path, body);
    },
    ...options,
  });
}
