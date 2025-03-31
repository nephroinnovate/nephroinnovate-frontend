import axios from 'axios';
import { API_BASE_URL, handleAuthError } from './config';

// Create an axios instance with the token in headers
const getAuthorizedAxios = () => {
  // Get token fresh every time
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No auth token found in localStorage');
    throw new Error('Authentication required');
  }

  console.log('Creating axios instance with token:', token.substring(0, 10) + '...');

  // Create axios instance with appropriate headers
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  // Add response interceptor to handle auth errors
  instance.interceptors.response.use(
    response => {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
      return response;
    },
    error => {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });

      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        console.warn('401 Unauthorized response received');
        handleAuthError();
        return Promise.reject(new Error('Authentication failed'));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const usersApi = {
  getAllUsers: async (page = 1, limit = 10) => {
    try {
      const api = getAuthorizedAxios();
      console.log('Fetching users with params:', { page, limit });
      
      // Properly send pagination parameters to the server
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      console.log('Raw API response:', response.data);
      
      // Transform the response to match Material-UI's pagination expectations
      const data = response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        // If server returns just an array, use its length as total
        return {
          items: data,
          total: data.length
        };
      } else if (data && typeof data === 'object') {
        // If server returns paginated response object
        return {
          items: Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []),
          total: data.total || data.totalCount || (Array.isArray(data.items) ? data.items.length : 0)
        };
      }
      
      return { items: [], total: 0 };
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response?.data);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      return { items: [], total: 0 };
    }
  },

  registerUser: async (userData) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to register user');
      }
      throw new Error('Authentication failed');
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

  getAllPatients: async (page = 1, limit = 10, search = '') => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/patients?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patients');
      }
      return { items: [], total: 0 };
    }
  },

  getAllInstitutions: async (page = 1, limit = 10, search = '') => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/institutions?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching institutions:', error);
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch institutions');
      }
      return { items: [], total: 0 };
    }
  }
};

export default usersApi;
