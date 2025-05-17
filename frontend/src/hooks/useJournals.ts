// frontend/src/hooks/useJournals.ts
// React Query hooks for journal entries

import { useMutation, useQuery, useQueryClient, useInfiniteQuery, QueryKey, InfiniteData, QueryFunctionContext } from '@tanstack/react-query';
import journalApi from '../services/journals/journalApi';
import { 
  JournalEntryCreateDTO, 
  JournalEntryUpdateDTO, 
  JournalEntryFilterOptions,
  SearchQuery,
  JournalEntry,
  PaginatedJournalResponse
} from '../types/journal';
import { toast } from 'react-toastify';
import { JOURNAL_KEYS } from './queryKeys';

export const useJournalEntries = (
  filters?: JournalEntryFilterOptions,
  limit = 10,
  cursor?: string,
  enabled = true
) => {
  return useQuery({
    queryKey: JOURNAL_KEYS.list({ filters, limit, cursor }),
    queryFn: () => journalApi.getJournalEntries(filters, limit, cursor),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInfiniteJournalEntries = (
  filters?: JournalEntryFilterOptions,
  limit = 10,
  enabled = true
) => {
  return useInfiniteQuery<PaginatedJournalResponse, Error, InfiniteData<PaginatedJournalResponse>, QueryKey, string>({
    queryKey: [...JOURNAL_KEYS.lists(), 'infinite', { filters, limit }],
    queryFn: (context: QueryFunctionContext<QueryKey, string>) => 
      journalApi.getJournalEntries(filters, limit, context.pageParam ?? ''),
    initialPageParam: '',
    enabled,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useJournalEntry = (id: string, enabled = true) => {
  return useQuery({
    queryKey: JOURNAL_KEYS.detail(id),
    queryFn: () => journalApi.getJournalEntry(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSearchJournalEntries = (
  query: SearchQuery,
  limit = 10,
  enabled = true
) => {
  return useInfiniteQuery<PaginatedJournalResponse, Error, InfiniteData<PaginatedJournalResponse>, QueryKey, string>({
    queryKey: [...JOURNAL_KEYS.search(query.q), { limit }],
    queryFn: (context: QueryFunctionContext<QueryKey, string>) => 
      journalApi.searchJournalEntries(query, limit, context.pageParam ?? ''),
    initialPageParam: '',
    enabled: !!query.q && enabled,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (entry: JournalEntryCreateDTO) => journalApi.createJournalEntry(entry),
    onSuccess: (newEntry: JournalEntry) => {
      // Invalidate the list query to refetch data
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
      
      // Optionally update cache directly for a smoother UX
      queryClient.setQueryData<{ items: JournalEntry[]; hasMore: boolean }>(
        JOURNAL_KEYS.list({}), 
        (oldData) => {
          if (!oldData) return { items: [newEntry], hasMore: false };
          return {
            items: [newEntry, ...oldData.items],
            hasMore: oldData.hasMore
          };
        }
      );
      
      toast.success('Journal entry created successfully');
    },
    onError: (error: Error) => {
      console.error('Error creating journal entry:', error);
      toast.error(`Failed to create journal entry: ${error.message}`);
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: JournalEntryUpdateDTO }) => 
      journalApi.updateJournalEntry(id, updates),
    onSuccess: (updatedEntry: JournalEntry, variables) => {
      // Invalidate the specific entry and the list
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
      
      // Optionally update cache directly for a smoother UX
      queryClient.setQueryData(JOURNAL_KEYS.detail(variables.id), updatedEntry);
      
      toast.success('Journal entry updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating journal entry:', error);
      toast.error(`Failed to update journal entry: ${error.message}`);
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => journalApi.deleteJournalEntry(id),
    onSuccess: (_data, id) => {
      // Invalidate the list query and remove the detail from cache
      queryClient.invalidateQueries({ queryKey: JOURNAL_KEYS.lists() });
      queryClient.removeQueries({ queryKey: JOURNAL_KEYS.detail(id) });
      
      // Optionally update cache directly for a smoother UX
      queryClient.setQueryData<{ items: JournalEntry[]; hasMore: boolean }>(
        JOURNAL_KEYS.list({}),
        (oldData) => {
          if (!oldData) return { items: [], hasMore: false };
          return {
            items: oldData.items.filter(entry => entry.id !== id),
            hasMore: oldData.hasMore
          };
        }
      );
      
      toast.success('Journal entry deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting journal entry:', error);
      toast.error(`Failed to delete journal entry: ${error.message}`);
    },
  });
};

export const useUploadAttachment = () => {
  return useMutation({
    mutationFn: (file: File) => journalApi.uploadAttachment(file),
    onError: (error: Error) => {
      console.error('Error uploading attachment:', error);
      toast.error(`Failed to upload attachment: ${error.message}`);
    },
  });
}; 