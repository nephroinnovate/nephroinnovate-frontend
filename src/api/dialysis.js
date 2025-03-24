import axios from 'axios';
import { API_BASE_URL, getAuthorizedHeaders, isDebugMode, isTokenValid } from './config';

const getAuthorizedAxios = () => {
  const token = localStorage.getItem('token');

  const isAuth = token && isTokenValid();

  if (isDebugMode) {
    console.log('Token status for API request:', isAuth ? 'Valid' : 'Invalid/Missing');
  }

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      Authorization: isAuth ? `Bearer ${token}` : undefined
    }
  });

  // Add response interceptor to handle auth errors
  instance.interceptors.response.use(
    response => response,
    error => {
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        if (isDebugMode) {
          console.warn('401 Unauthorized response received');
        }
        console.warn('Authentication error received from API');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const dialysisApi = {
  getSessionsByPatient: async (patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/hemodialysis-sessions?patient_id=${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialysis sessions:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching dialysis sessions - user may need to log in');
        return [];
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch dialysis sessions');
      }
      throw new Error('Network error occurred');
    }
  },

  getSessionById: async (sessionId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/hemodialysis-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dialysis session:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching dialysis session - user may need to log in');
        return null;
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch dialysis session');
      }
      throw new Error('Network error occurred');
    }
  },

  createSession: async (sessionData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post('/hemodialysis-sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error creating dialysis session:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create dialysis session');
      }
      throw new Error('Network error occurred');
    }
  },

  updateSession: async (sessionId, sessionData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.patch(`/hemodialysis-sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      console.error('Error updating dialysis session:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update dialysis session');
      }
      throw new Error('Network error occurred');
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.delete(`/hemodialysis-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting dialysis session:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to delete dialysis session');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default dialysisApi;
