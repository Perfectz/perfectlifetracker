import { useInfiniteQuery, UseInfiniteQueryOptions, InfiniteData, infiniteQueryOptions } from '@tanstack/react-query';

/**
 * Generic type for paginated API responses
 */
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  count: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

/**
 * Options for usePaginatedQuery hook
 */
export interface UsePaginatedQueryOptions<T, TParams> {
  queryKey: string[];
  fetchFn: (params: TParams, cursor?: string) => Promise<PaginatedResponse<T>>;
  params: TParams;
  enabled?: boolean;
  limit?: number;
}

/**
 * A hook that handles paginated queries with cursor-based pagination
 * @param options Hook options including fetch function, parameters, and standard query options
 * @returns InfiniteQuery result
 */
export function usePaginatedQuery<T, TParams>(
  options: UsePaginatedQueryOptions<T, TParams>
) {
  const { 
    queryKey,
    fetchFn, 
    params, 
    enabled = true, 
    limit = 10
  } = options;

  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchFn(params, pageParam),
    initialPageParam: undefined as string | undefined,
    enabled,
    getNextPageParam: (lastPage: PaginatedResponse<T>) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    }
  });
} 