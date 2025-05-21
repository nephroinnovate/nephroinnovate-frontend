import axios from 'axios';
import {API_BASE_URL, parseErrorResponse, normalizeFieldNames, sanitizeData} from './config';

const authApi = {
  register: async (userData) => {
    try {
        const sanitizedData = sanitizeData(userData);
        const normalizedData = normalizeFieldNames(sanitizedData);
      const backendUserData = {
        ...normalizedData,
          username: sanitizedData.email,
        password_confirm: normalizedData.password
      };

      console.log('Registering with data:', { ...backendUserData, password: '[REDACTED]' });
      const response = await axios.post(`${API_BASE_URL}/auth/register`, backendUserData, {
          headers: {'Content-Type': 'application/json'}
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  login: async (credentials) => {
    try {
        const sanitizedCredentials = sanitizeData(credentials);
        const normalizedCredentials = normalizeFieldNames(sanitizedCredentials);
      const backendCredentials = {
        ...normalizedCredentials,
          username: sanitizedCredentials.email
      };

        console.log('Logging in with username:', sanitizedCredentials.email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, backendCredentials, {
          headers: {'Content-Type': 'application/json'}
      });
      console.log('Login response:', {
        data: response.data,
        user: response.data.user,
        token: response.data.access_token ? 'present' : 'missing'
      });

      const token = response.data.access_token ||
          (response.data.tokens && response.data.tokens.access) ||
          response.data.token;

      const refreshToken = response.data.refresh_token ||
          (response.data.tokens && response.data.tokens.refresh);

      if (token) {
        localStorage.setItem('token', token);

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        localStorage.setItem('userRole', response.data.role || response.data.user?.role || 'user');
        localStorage.setItem('userId', response.data.id || response.data.user?.id);

        const relatedEntityId = response.data.relatedEntityId ||
            response.data.user?.relatedEntityId;
        if (relatedEntityId) {
          localStorage.setItem('relatedEntityId', relatedEntityId.toString());
        }
        console.log('Login successful. Role:', response.data.role || response.data.user?.role, 'RelatedEntityId:', relatedEntityId);
      } else {
        console.error('No token found in response:', response.data);
        throw new Error('Authentication failed: No token received');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  logout: () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
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
        token: token ? `${token.substring(0, 15)}...` : null,
      userRole,
      userId
    };
  }
};

export default authApi;
