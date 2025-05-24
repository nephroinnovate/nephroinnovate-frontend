import apiClient, {API_BASE_URL, parseErrorResponse} from './config';
import {logSecurityEvent} from '../utils/auditLogger';

const authApi = {
  register: async (userData) => {
    try {
      const backendUserData = {
        email: userData.email,
        password: userData.password,
        password_confirm: userData.password,
        first_name: userData.first_name || userData.firstName || '',
        last_name: userData.last_name || userData.lastName || '',
        phone: userData.phone || '',
        role: userData.role || 'patient'
      };

      console.log('Registering with email:', backendUserData.email);
      const response = await apiClient.post('/auth/register/', backendUserData);

      // The backend returns the created user, not tokens
      console.log('Registration successful:', response.data);

        // Log security event
        logSecurityEvent('registration', {
            email: backendUserData.email,
            role: backendUserData.role
        });

        return response.data;
    } catch (error) {
      console.error('Registration error:', error);
        logSecurityEvent('registration_failed', {
            email: userData.email,
            error: error.message
        }, 'failure');
      throw new Error(parseErrorResponse(error));
    }
  },

  login: async (credentials) => {
    try {
      const backendCredentials = {
        email: credentials.email,
        password: credentials.password
      };

      console.log('Logging in with email:', backendCredentials.email);
      const response = await apiClient.post('/auth/login/', backendCredentials);

      console.log('Login response:', response.data);

      // Extract tokens from the response
      const accessToken = response.data.access_token || response.data.tokens?.access;
      const refreshToken = response.data.refresh_token || response.data.tokens?.refresh;

      if (accessToken) {
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

        // Store user information
        const user = response.data.user || {};
        localStorage.setItem('userRole', response.data.role || user.role || 'patient');
        localStorage.setItem('userId', response.data.id || user.id || '');

        const relatedEntityId = response.data.relatedEntityId || user.relatedEntityId;
        if (relatedEntityId) {
          localStorage.setItem('relatedEntityId', relatedEntityId.toString());
        }

        console.log('Login successful. Role:', response.data.role || user.role);

          // Log security event
          logSecurityEvent('login', {
              email: backendCredentials.email,
              role: response.data.role || user.role,
              userId: response.data.id || user.id
          });
      } else {
        console.error('No access token found in response:', response.data);
        throw new Error('Authentication failed: No token received');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
        logSecurityEvent('login_failed', {
            email: credentials.email,
            error: error.message
        }, 'failure');
      throw new Error(parseErrorResponse(error));
    }
  },

  logout: () => {
    console.log('Logging out');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

      // Log security event before clearing
      logSecurityEvent('logout', {
          userId,
          userRole
      });

      localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('relatedEntityId');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return token !== null;
  },

  isAdmin: () => {
    return localStorage.getItem('userRole') === 'admin';
  },

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
  },

    refreshToken: async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await apiClient.post('/auth/refresh/', {
                refresh: refreshToken
            });

            const newAccessToken = response.data.access;
            localStorage.setItem('token', newAccessToken);

            // Log security event
            logSecurityEvent('token_refresh', {
                userId: localStorage.getItem('userId')
            });

            return newAccessToken;
        } catch (error) {
            console.error('Token refresh error:', error);
            logSecurityEvent('token_refresh_failed', {
                error: error.message
            }, 'failure');
            throw new Error(parseErrorResponse(error));
        }
  }
};

export default authApi;
