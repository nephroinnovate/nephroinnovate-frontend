// Simple direct API helper for institutions
import axios from 'axios';
import { API_BASE_URL } from './config';

// Helper function to make authenticated requests
const api = {
  // Get auth token from localStorage
  getToken: () => localStorage.getItem('token'),

  // GET request with authentication
  get: async (url) => {
    const token = api.getToken();
    try {
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      api.handleError(error);
      throw error;
    }
  },

  // POST request with authentication
  post: async (url, data) => {
    const token = api.getToken();
    try {
      const response = await axios.post(`${API_BASE_URL}${url}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      api.handleError(error);
      throw error;
    }
  },

  // PATCH request with authentication
  patch: async (url, data) => {
    const token = api.getToken();
    try {
      const response = await axios.patch(`${API_BASE_URL}${url}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      api.handleError(error);
      throw error;
    }
  },

  // DELETE request with authentication
  delete: async (url) => {
    const token = api.getToken();
    try {
      const response = await axios.delete(`${API_BASE_URL}${url}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      api.handleError(error);
      throw error;
    }
  },

  // Error handler
  handleError: (error) => {
    // If we get a 401, clear tokens and redirect to login
    if (error.response && error.response.status === 401) {
      console.error('Authentication error:', error.response.data);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      window.location.href = '/';
    }

    // Extract the error message
    const message = error.response?.data?.message || 'An unknown error occurred';
    console.error(`API Error: ${message}`);
  }
};

const institutionsApi = {
  // Get all institutions
  getAllInstitutions: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/institutions?page=${page}&limit=${limit}`);
      return response;
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch institutions');
      }
      return { items: [], total: 0 };
    }
  },

  // Get a specific institution
  getInstitution: async (institutionId) => {
    try {
      return await api.get(`/institutions/${institutionId}`);
    } catch (error) {
      if (error.response && error.response.status !== 401) {
        throw new Error(error.response?.data?.message || 'Failed to fetch institution');
      }
      return null;
    }
  },

  // Create a new institution
  createInstitution: async (institutionData) => {
    try {
      console.log('Creating institution with data:', institutionData);
      return await api.post('/institutions', institutionData);
    } catch (error) {
      console.error('Create institution error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create institution');
    }
  },

  // Update an existing institution
  updateInstitution: async (institutionId, institutionData) => {
    try {
      console.log(`Updating institution ${institutionId} with data:`, institutionData);
      return await api.patch(`/institutions/${institutionId}`, institutionData);
    } catch (error) {
      console.error('Update institution error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update institution');
    }
  },

  // Delete an institution
  deleteInstitution: async (institutionId) => {
    try {
      return await api.delete(`/institutions/${institutionId}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete institution');
    }
  }
};

export default institutionsApi;
