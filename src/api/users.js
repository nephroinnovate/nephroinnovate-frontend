import axios from 'axios';
import { API_BASE_URL, handleAuthError } from './config';

// Create an axios instance with the token in headers
const getAuthorizedAxios = () => {
  // Get token fresh every time
  const token = localStorage.getItem('token');

  // Create axios instance with appropriate headers
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });

  // Add response interceptor to handle auth errors
  instance.interceptors.response.use(
    response => response,
    error => {
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        console.warn('401 Unauthorized response received');
        handleAuthError();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const usersApi = {
  getAllUsers: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response && error.response.status !== 401) {
        // 401 errors are already handled by interceptor
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      return [];
    }
  },

  getUserProfile: async (userId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
      }
      throw new Error('Authentication failed');
    }
  },

  getCurrentUserProfile: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user logged in');
    }

    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current user profile:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch current user profile');
      }
      throw new Error('Authentication failed');
    }
  },

  updateUserProfile: async (userId, userData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to update user profile');
      }
      throw new Error('Authentication failed');
    }
  },

  updateCurrentUserProfile: async (userData) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user logged in');
    }

    try {
      const api = getAuthorizedAxios();
      const response = await api.patch(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating current user profile:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to update user profile');
      }
      throw new Error('Authentication failed');
    }
  },

  makeUserAdmin: async (userId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post(`/user-roles/make-admin/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error making user admin:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to make user admin');
      }
      throw new Error('Authentication failed');
    }
  },

  linkUserToPatient: async (userId, patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post(`/user-roles/link-patient/${userId}/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error linking user to patient:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to link user to patient');
      }
      throw new Error('Authentication failed');
    }
  },

  linkUserToInstitution: async (userId, institutionId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post(`/user-roles/link-institution/${userId}/${institutionId}`);
      return response.data;
    } catch (error) {
      console.error('Error linking user to institution:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to link user to institution');
      }
      throw new Error('Authentication failed');
    }
  },

  getAllPatients: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patients');
      }
      return [];
    }
  },

  getAllInstitutions: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/institutions');
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch institutions');
      }
      return [];
    }
  }
};

export default usersApi;
