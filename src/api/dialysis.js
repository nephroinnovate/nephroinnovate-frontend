import axios from 'axios';
import {
  API_BASE_URL,
  getAuthorizedHeaders,
  isDebugMode,
  isTokenValid,
  parseErrorResponse,
  parseDateFields,
  normalizeFieldNames,
    formatDateTimeForAPI,
    encodeQueryParams,
    normalizeTimezone,
    normalizeNumber,
    sanitizeData
} from './config';

const getAuthorizedAxios = () => {
  const token = localStorage.getItem('token');

  const isAuth = token && isTokenValid();

  if (isDebugMode) {
    console.log('Token status for API request:', isAuth ? 'Valid' : 'Invalid/Missing');
  }

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
        console.warn('Authentication error received from API');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Helper function to normalize pagination data
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

const dialysisApi = {
  getSessionsByPatient: async (patientId, page = 1, pageSize = 10) => {
    try {
      const api = getAuthorizedAxios();
        const params = {patient_id: patientId, page, page_size: pageSize};
        const queryString = encodeQueryParams(params);
        const response = await api.get(`/hemodialysis-sessions${queryString}`);
      return normalizePaginationResponse(response.data);
    } catch (error) {
      console.error('Error fetching dialysis sessions:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching dialysis sessions - user may need to log in');
        return {items: [], total: 0};
      }
      throw new Error(parseErrorResponse(error));
    }
  },

  getSessionById: async (sessionId) => {
    try {
      const api = getAuthorizedAxios();
      const response = await api.get(`/hemodialysis-sessions/${sessionId}`);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error fetching dialysis session:', error);
      if (error.response && error.response.status === 401) {
        console.warn('Authentication error when fetching dialysis session - user may need to log in');
        return null;
      }
      throw new Error(parseErrorResponse(error));
    }
  },

  createSession: async (sessionData) => {
    try {
        // Format dates for API
        const formattedData = {...sessionData};
        if (formattedData.session_date) {
            formattedData.session_date = formatDateTimeForAPI(normalizeTimezone(formattedData.session_date));
        }

        // Normalize numeric fields
        if (formattedData.treatment_time) {
            formattedData.treatment_time = normalizeNumber(formattedData.treatment_time);
        }
        if (formattedData.urea) {
            formattedData.urea = normalizeNumber(formattedData.urea);
        }

        // Sanitize data before sending
        const sanitizedData = sanitizeData(formattedData);

        const api = getAuthorizedAxios();
        const response = await api.post('/hemodialysis-sessions', sanitizedData);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error creating dialysis session:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  updateSession: async (sessionId, sessionData) => {
    try {
        // Format dates for API
        const formattedData = {...sessionData};
        if (formattedData.session_date) {
            formattedData.session_date = formatDateTimeForAPI(normalizeTimezone(formattedData.session_date));
        }

        // Normalize numeric fields
        if (formattedData.treatment_time) {
            formattedData.treatment_time = normalizeNumber(formattedData.treatment_time);
        }
        if (formattedData.urea) {
            formattedData.urea = normalizeNumber(formattedData.urea);
        }

        // Sanitize data before sending
        const sanitizedData = sanitizeData(formattedData);

        const api = getAuthorizedAxios();
        const response = await api.patch(`/hemodialysis-sessions/${sessionId}`, sanitizedData);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error updating dialysis session:', error);
        throw new Error(parseErrorResponse(error));
    }
  },

  deleteSession: async (sessionId) => {
    try {
      const api = getAuthorizedAxios();
        await api.delete(`/hemodialysis-sessions/${sessionId}`);
        return true;
    } catch (error) {
      console.error('Error deleting dialysis session:', error);
        throw new Error(parseErrorResponse(error));
    }
  }
};

export default dialysisApi;