import axios from 'axios';
import {
    API_BASE_URL,
    getAuthorizedHeaders,
    isDebugMode,
    isTokenValid,
    handleAuthError,
    parseErrorResponse,
    normalizeFieldNames,
    normalizeBooleanField,
    formatDateTimeForAPI,
    formatDateOnlyForAPI,
    encodeQueryParams,
    normalizeTimezone,
    sanitizeData
} from './config';

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
        'Content-Type': 'application/json',
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

// Helper function to handle pagination responses
const normalizePaginationResponse = (data) => {
    // Handle different pagination response formats
    if (data.items && typeof data.total === 'number') {
        // Already in the expected format
        return {
            items: normalizeFieldNames(data.items),
            total: data.total
        };
    } else if (data.resourceType === 'Bundle' && Array.isArray(data.entry)) {
        // FHIR Bundle format
        return {
            items: normalizeFieldNames(data.entry.map(item => item.resource)),
            total: data.total || data.entry.length
        };
    } else if (Array.isArray(data)) {
        // Just an array of items
        return {
            items: normalizeFieldNames(data),
            total: data.length
        };
    }

    // Fallback: return empty results
    console.warn('Unexpected pagination format received:', data);
    return {items: [], total: 0};
};

const patientsApi = {
  getAllPatients: async (page = 1, limit = 10) => {
    try {
      const api = getAuthorizedAxios();
        const response = await api.get(`/patients${encodeQueryParams({page, page_size: limit})}`);
        return normalizePaginationResponse(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        // Silently handle auth errors
        console.warn('Authentication error when fetching patients - user may need to log in');
        return { items: [], total: 0 };
      }

        throw new Error(parseErrorResponse(error));
    }
  },

  getPatient: async (patientId) => {
    try {
      console.log('getPatient called with ID:', patientId);
      console.log('Current auth status:', {
        token: localStorage.getItem('token') ? 'present' : 'missing',
        userRole: localStorage.getItem('userRole'),
        relatedEntityId: localStorage.getItem('relatedEntityId')
      });
      
      const api = getAuthorizedAxios();
      console.log('Making API request to:', `${API_BASE_URL}/patients/${patientId}`);
      const response = await api.get(`/patients/${patientId}`);
      console.log('API response:', response.data);
        return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching patient - user may need to log in');
        return null;
      }

        throw new Error(parseErrorResponse(error));
    }
  },

  createPatient: async (patientData) => {
    try {
        // Ensure dates are in ISO format with timezone normalization
        const formattedData = {...patientData};
        if (formattedData.birth_date) {
            const date = new Date(formattedData.birth_date);
            formattedData.birth_date = formatDateOnlyForAPI(normalizeTimezone(date));
        }

        const sanitizedData = sanitizeData(formattedData);
        const api = getAuthorizedAxios();
        const response = await api.post('/patients', sanitizedData);
        return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error creating patient:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  updatePatient: async (patientId, patientData) => {
    try {
        // Ensure dates are in ISO format with timezone normalization
        const formattedData = {...patientData};
        if (formattedData.birth_date) {
            const date = new Date(formattedData.birth_date);
            formattedData.birth_date = formatDateOnlyForAPI(normalizeTimezone(date));
        }

        const sanitizedData = sanitizeData(formattedData);
        const api = getAuthorizedAxios();
        const response = await api.patch(`/patients/${patientId}`, sanitizedData);
        return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error updating patient:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  deletePatient: async (patientId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  getAllInstitutions: async () => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get('/institutions');
        return normalizePaginationResponse(response.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);

      // Check if the error is due to authentication
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching institutions - user may need to log in');
        return { items: [], total: 0 };
      }

        throw new Error(parseErrorResponse(error));
    }
  }
};

export default patientsApi;