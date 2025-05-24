import apiClient from './config';
import {normalizeListResponse, handleApiError} from './helpers';
import {logResourceAccess, logSecurityEvent} from '../utils/auditLogger';

const usersApi = {
  getAllUsers: async (page = 1, limit = 10) => {
      try {
      console.log('Fetching users with params:', {page, limit});
      const response = await apiClient.get('/users/', {
          params: {page, page_size: limit}
      });

        return normalizeListResponse(response);
    } catch (error) {
        throw handleApiError(error, 'getAllUsers');
    }
  },

  registerUser: async (userData) => {
      try {
      const response = await apiClient.post('/auth/register/', userData);
      return response.data;
    } catch (error) {
        throw handleApiError(error, 'registerUser');
    }
  },

  getUserProfile: async (userId) => {
      try {
      const response = await apiClient.get(`/users/${userId}/`);

        // Log access
        logResourceAccess('User', userId, 'read');

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'getUserProfile');
    }
  },

  getCurrentUserProfile: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user logged in');
    }

      try {
      const response = await apiClient.get(`/users/${userId}/`);

        // Log access
        logResourceAccess('User', userId, 'read');

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'getCurrentUserProfile');
    }
  },

  updateUserProfile: async (userId, userData) => {
      try {
      const response = await apiClient.patch(`/users/${userId}/`, userData);

        // Log update
        logResourceAccess('User', userId, 'update');

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'updateUserProfile');
    }
  },

  updateCurrentUserProfile: async (userData) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user logged in');
    }

      try {
      const response = await apiClient.patch(`/users/${userId}/`, userData);

        // Log update
        logResourceAccess('User', userId, 'update');

        return response.data;
    } catch (error) {
        throw handleApiError(error, 'updateCurrentUserProfile');
    }
  },

  makeUserAdmin: async (userId) => {
      try {
          const response = await apiClient.post(`/users/${userId}/make-admin/`);

          // Log security event
          logSecurityEvent('role_change', {
              userId,
              newRole: 'admin',
              action: 'make_admin'
          });

          return response.data;
    } catch (error) {
        throw handleApiError(error, 'makeUserAdmin');
    }
  },

  linkUserToPatient: async (userId, patientId) => {
      try {
          const response = await apiClient.post(`/users/${userId}/link-patient/${patientId}/`);

          // Log security event
          logSecurityEvent('role_change', {
              userId,
              patientId,
              newRole: 'patient',
              action: 'link_patient'
          });

          return response.data;
    } catch (error) {
        throw handleApiError(error, 'linkUserToPatient');
    }
  },

  linkUserToInstitution: async (userId, institutionId) => {
      try {
          const response = await apiClient.post(`/users/${userId}/link-institution/${institutionId}/`);

          // Log security event
          logSecurityEvent('role_change', {
              userId,
              institutionId,
              newRole: 'institution_user',
              action: 'link_institution'
          });

          return response.data;
    } catch (error) {
        throw handleApiError(error, 'linkUserToInstitution');
    }
  },

  getAllPatients: async (page = 1, limit = 10, search = '') => {
      try {
      const response = await apiClient.get('/patients/', {
          params: {page, page_size: limit, search}
      });

        return normalizeListResponse(response);
    } catch (error) {
        throw handleApiError(error, 'getAllPatients');
    }
  },

  getAllInstitutions: async (page = 1, limit = 10, search = '') => {
      try {
      const response = await apiClient.get('/organizations/', {
          params: {page, page_size: limit, search}
      });

        return normalizeListResponse(response);
    } catch (error) {
        throw handleApiError(error, 'getAllInstitutions');
    }
  }
};

export default usersApi;
