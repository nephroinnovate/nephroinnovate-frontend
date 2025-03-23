import axios from 'axios';

const API_BASE_URL = 'https://nephroinnovate-api-ultra-minimal-fpgdfabhc7c9egej.swedencentral-01.azurewebsites.net';

const authApi = {
  register: async (userData) => {
    try {
      const backendUserData = {
        username: userData.email,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      const response = await axios.post(`${API_BASE_URL}/auth/register`, backendUserData);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw new Error('Network error occurred');
    }
  },

  login: async (credentials) => {
    try {
      const backendCredentials = {
        username: credentials.email,
        password: credentials.password
      };

      const response = await axios.post(`${API_BASE_URL}/auth/login`, backendCredentials);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default authApi;
