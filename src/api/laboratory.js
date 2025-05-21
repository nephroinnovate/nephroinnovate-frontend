import axios from 'axios';
import {
  API_BASE_URL,
  getAuthorizedHeaders,
  parseErrorResponse,
  normalizeFieldNames,
  formatDateTimeForAPI,
  encodeQueryParams,
  normalizeTimezone,
  normalizeNumber,
  sanitizeData
} from './config';

// Create an axios instance with authentication
const getApi = () => {
  const headers = getAuthorizedHeaders();
  return axios.create({
    baseURL: API_BASE_URL,
    headers
  });
};

// Helper function to normalize pagination data
const normalizePaginationResponse = (data) => {
  if (data.items && typeof data.total === 'number') {
    return {
      items: normalizeFieldNames(data.items),
      total: data.total
    };
  } else if (data.resourceType === 'Bundle' && Array.isArray(data.entry)) {
    return {
      items: normalizeFieldNames(data.entry.map(item => item.resource)),
      total: data.total || data.entry.length
    };
  } else if (Array.isArray(data)) {
    return {
      items: normalizeFieldNames(data),
      total: data.length
    };
  }

  console.warn('Unexpected pagination format received:', data);
  return {items: [], total: 0};
};

const laboratoryApi = {
  getLabResultsByPatient: async (patientId) => {
    try {
      const api = getApi();
        const response = await api.get(`/laboratory-results${encodeQueryParams({patient_id: patientId})}`);
      return normalizePaginationResponse(response.data);
    } catch (error) {
      console.error('Error fetching laboratory results:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  getLabResultsBySession: async (sessionId) => {
    try {
      const api = getApi();
        const response = await api.get(`/laboratory-results${encodeQueryParams({session_id: sessionId})}`);
      return normalizePaginationResponse(response.data);
    } catch (error) {
      console.error('Error fetching laboratory results for session:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  getLabResult: async (resultId) => {
    try {
      const api = getApi();
      const response = await api.get(`/laboratory-results/${resultId}`);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error fetching laboratory result:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  createLabResult: async (resultData) => {
    try {
      const formattedData = {...resultData};
      if (formattedData.date) {
          formattedData.date = formatDateTimeForAPI(normalizeTimezone(formattedData.date));
      }
      // Fix field name mismatch - 'date' in frontend vs 'test_date' in backend
      if (formattedData.date && !formattedData.test_date) {
        formattedData.test_date = formattedData.date;
      }

      // Normalize numeric fields
      Object.keys(formattedData).forEach(key => {
        if (typeof formattedData[key] === 'number') {
          formattedData[key] = normalizeNumber(formattedData[key]);
        }
      });

      // Sanitize data before sending
      const sanitizedData = sanitizeData(formattedData);

      const api = getApi();
      const response = await api.post('/laboratory-results', sanitizedData);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error creating laboratory result:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  updateLabResult: async (resultId, resultData) => {
    try {
      const formattedData = {...resultData};
      if (formattedData.date) {
          formattedData.date = formatDateTimeForAPI(normalizeTimezone(formattedData.date));
      }
      // Fix field name mismatch - 'date' in frontend vs 'test_date' in backend
      if (formattedData.date && !formattedData.test_date) {
        formattedData.test_date = formattedData.date;
      }

      // Normalize numeric fields
      Object.keys(formattedData).forEach(key => {
        if (typeof formattedData[key] === 'number') {
          formattedData[key] = normalizeNumber(formattedData[key]);
        }
      });

      // Sanitize data before sending
      const sanitizedData = sanitizeData(formattedData);

      const api = getApi();
      const response = await api.patch(`/laboratory-results/${resultId}`, sanitizedData);
      return normalizeFieldNames(response.data);
    } catch (error) {
      console.error('Error updating laboratory result:', error);
      throw new Error(parseErrorResponse(error));
    }
  },

  deleteLabResult: async (resultId) => {
    try {
      const api = getApi();
      await api.delete(`/laboratory-results/${resultId}`);
      return true;
    } catch (error) {
      console.error('Error deleting laboratory result:', error);
      throw new Error(parseErrorResponse(error));
    }
  }
};

export default laboratoryApi;