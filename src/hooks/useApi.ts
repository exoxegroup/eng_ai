import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionApi, messageApi } from '../services/apiService';

// Session hooks
export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionApi.getAllSessions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};

export const useSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => sessionApi.getSession(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionData: any) => sessionApi.createSession(sessionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, data }: { sessionId: string; data: any }) => 
      sessionApi.updateSession(sessionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => sessionApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// Message hooks
export const useMessages = (sessionId: string) => {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: () => messageApi.getMessagesBySession(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  });
};

export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ sessionId, messageData }: { sessionId: string; messageData: any }) => 
      messageApi.createMessage(sessionId, messageData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, data }: { messageId: string; data: any }) => 
      messageApi.updateMessage(messageId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => messageApi.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};