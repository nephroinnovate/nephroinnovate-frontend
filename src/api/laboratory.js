import axios from 'axios';
import { API_BASE_URL, getAuthorizedHeaders, isDebugMode, isTokenValid } from './config';

// Create an axios instance with the token in headers
const getAuthorizedAxios = () => {
  const token = localStorage.getItem('token');

  // Check if token is valid
  const isAuth = token && isTokenValid();

  if (isDebugMode) {
    console.log('Token status for API request:', isAuth ? 'Valid' : 'Invalid/Missing');
  }

  // Create axios instance with appropriate headers
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

const laboratoryApi = {
  getLabResultsByPatient: async (patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/laboratory-results?patient_id=${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching laboratory results:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching laboratory results - user may need to log in');
        return [];
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch laboratory results');
      }
      throw new Error('Network error occurred');
    }
  },

  getLabResultsBySession: async (sessionId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/laboratory-results?session_id=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching laboratory results for session:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching laboratory results - user may need to log in');
        return [];
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch laboratory results');
      }
      throw new Error('Network error occurred');
    }
  },

  getLabResult: async (resultId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/laboratory-results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching laboratory result:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching laboratory result - user may need to log in');
        return null;
      }
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch laboratory result');
      }
      throw new Error('Network error occurred');
    }
  },

  createLabResult: async (resultData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post('/laboratory-results', resultData);
      return response.data;
    } catch (error) {
      console.error('Error creating laboratory result:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create laboratory result');
      }
      throw new Error('Network error occurred');
    }
  },

  updateLabResult: async (resultId, resultData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.patch(`/laboratory-results/${resultId}`, resultData);
      return response.data;
    } catch (error) {
      console.error('Error updating laboratory result:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update laboratory result');
      }
      throw new Error('Network error occurred');
    }
  },

  deleteLabResult: async (resultId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.delete(`/laboratory-results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting laboratory result:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to delete laboratory result');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default laboratoryApi;
