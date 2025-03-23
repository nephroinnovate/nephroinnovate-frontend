import axios from 'axios';
import { API_BASE_URL, getAuthorizedHeaders, isDebugMode, isTokenValid, handleAuthError } from './config';

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

        // Only handle auth error if we're not already on an auth page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          // Silent handling - let the caller decide how to handle it
          console.warn('Authentication error received from API');
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

const patientsApi = {
  getAllPatients: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        // Silently handle auth errors
        console.warn('Authentication error when fetching patients - user may need to log in');
        return [];
      }

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch patients');
      }
      throw new Error('Network error occurred');
    }
  },

  getPatient: async (patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching patient - user may need to log in');
        return null;
      }

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch patient');
      }
      throw new Error('Network error occurred');
    }
  },

  createPatient: async (patientData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to create patient');
      }
      throw new Error('Network error occurred');
    }
  },

  updatePatient: async (patientId, patientData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.patch(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to update patient');
      }
      throw new Error('Network error occurred');
    }
  },

  deletePatient: async (patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to delete patient');
      }
      throw new Error('Network error occurred');
    }
  },

  getAllInstitutions: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/institutions');
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching institutions - user may need to log in');
        return [];
      }

      if (error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch institutions');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default patientsApi;
