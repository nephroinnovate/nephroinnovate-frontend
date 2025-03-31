import axios from 'axios';
import { API_BASE_URL } from './config';

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

      console.log('Registering with data:', { ...backendUserData, password: '[REDACTED]' });
      const response = await axios.post(`${API_BASE_URL}/auth/register`, backendUserData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  login: async (credentials) => {
    try {
      const backendCredentials = {
        username: credentials.email,
        password: credentials.password
      };

      console.log('Logging in with username:', credentials.email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, backendCredentials);
      console.log('Login response:', {
        data: response.data,
        user: response.data.user,
        token: response.data.access_token ? 'present' : 'missing'
      });

      // Store the access token and user role in localStorage
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userRole', response.data.role || 'user');
        localStorage.setItem('userId', response.data.id);
        
        // Get relatedEntityId from the user object
        const relatedEntityId = response.data.user?.relatedEntityId;
        if (relatedEntityId) {
          localStorage.setItem('relatedEntityId', relatedEntityId.toString());
        }
        console.log('Login successful. Role:', response.data.role, 'RelatedEntityId:', relatedEntityId);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  logout: () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('relatedEntityId');
  },

  // Check if current user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return token !== null;
  },

  // Check if current user is an admin
  isAdmin: () => {
    return localStorage.getItem('userRole') === 'admin';
  },

  // Get current auth status (useful for debugging)
  getAuthStatus: () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');

    return {
      isAuthenticated: !!token,
      token: token ? `${token.substring(0, 15)}...` : null, // Only show beginning of token for security
      userRole,
      userId
    };
  }
};

export default authApi;
