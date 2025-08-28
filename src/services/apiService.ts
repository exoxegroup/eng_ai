import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Session API functions
export const sessionApi = {
  getAllSessions: async () => {
    const response = await apiClient.get('/sessions');
    return response.data.data || [];
  },

  getSession: async (sessionId: string) => {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data.data;
  },

  createSession: async (sessionData: any) => {
    const response = await apiClient.post('/sessions', sessionData);
    return response.data.data;
  },

  updateSession: async (sessionId: string, sessionData: any) => {
    const response = await apiClient.put(`/sessions/${sessionId}`, sessionData);
    return response.data.data;
  },

  deleteSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/sessions/${sessionId}`);
    return response.data.data;
  },
};

// Message API functions
export const messageApi = {
  getMessagesBySession: async (sessionId: string) => {
    const response = await apiClient.get(`/sessions/${sessionId}/messages`);
    return response.data.data || [];
  },

  createMessage: async (sessionId: string, messageData: any) => {
    const response = await apiClient.post(`/sessions/${sessionId}/messages`, messageData);
    return response.data.data;
  },

  updateMessage: async (messageId: string, messageData: any) => {
    // Note: Update/delete might need to be handled differently based on backend implementation
    const response = await apiClient.put(`/messages/${messageId}`, messageData);
    return response.data.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data.data;
  },
};