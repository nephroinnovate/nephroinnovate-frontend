import axios from 'axios';

// Simple API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

console.log(`API Base URL: ${API_BASE_URL}`);

// Helper function to get authorized headers
export const getAuthorizedHeaders = () => {
  const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
  }

    return headers;
};

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: getAuthorizedHeaders()
});

// Helper to clear auth data and redirect
const clearAuthAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('relatedEntityId');
    window.location.href = '/login';
};

// Helper to refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken
        });
        return response.data.access;
    } catch (error) {
        throw error;
    }
};

// Transform dates to ISO format for API
const transformDatesToISO = (data) => {
    if (data instanceof Date) {
        return data.toISOString();
    }
    if (Array.isArray(data)) {
        return data.map(transformDatesToISO);
    }
    if (data && typeof data === 'object') {
        const transformed = {};
        for (const [key, value] of Object.entries(data)) {
            // Handle common date field names
            if (['date', 'created_at', 'updated_at', 'birth_date', 'test_date', 'published_at'].includes(key) && value) {
                if (value instanceof Date) {
                    transformed[key] = value.toISOString();
                } else if (typeof value === 'string' && !value.includes('T')) {
                    // Convert date-only strings to ISO format with time
                    transformed[key] = new Date(value).toISOString();
                } else {
                    transformed[key] = value;
                }
            } else {
                transformed[key] = transformDatesToISO(value);
            }
        }
        return transformed;
    }
    return data;
};

// Transform ISO strings to dates in responses
const transformISOToDates = (data) => {
    if (typeof data === 'string' && isISODateString(data)) {
        return new Date(data);
    }
    if (Array.isArray(data)) {
        return data.map(transformISOToDates);
    }
    if (data && typeof data === 'object') {
        const transformed = {};
        for (const [key, value] of Object.entries(data)) {
            transformed[key] = transformISOToDates(value);
        }
        return transformed;
    }
    return data;
};

// Check if string is ISO date format
const isISODateString = (value) => {
    if (typeof value !== 'string') return false;
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoDateRegex.test(value);
};

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Transform dates to ISO format in request data
        if (config.data) {
            config.data = transformDatesToISO(config.data);
        }

        return config;
    },
    error => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    response => {
        // Transform ISO strings back to Date objects in response
        if (response.data) {
            response.data = transformISOToDates(response.data);
        }
        return response;
    },
    error => {
        if (error.response && error.response.status === 401) {
            // Check if we have a refresh token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken && !error.config._retry) {
                error.config._retry = true;
                // Try to refresh the token
                return refreshAccessToken(refreshToken)
                    .then(newToken => {
                        localStorage.setItem('token', newToken);
                        error.config.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(error.config);
                    })
                    .catch(() => {
                        // Refresh failed, clear auth and redirect
                        clearAuthAndRedirect();
                        return Promise.reject(error);
                    });
            } else {
                clearAuthAndRedirect();
            }
        }
        return Promise.reject(error);
    }
);

// Parse error response
export const parseErrorResponse = (error) => {
    if (error.response && error.response.data) {
        const data = error.response.data;

        // Handle various error formats from backend
        if (data.message) {
            return data.message;
        } else if (data.error) {
            return data.error;
        } else if (data.detail) {
            return data.detail;
        } else if (data.errors) {
            // Handle validation errors
            if (Array.isArray(data.errors)) {
                return data.errors.join(', ');
            } else if (typeof data.errors === 'object') {
                return Object.entries(data.errors)
                    .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                    .join('; ');
            }
        } else if (data.non_field_errors) {
            return Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors;
        } else if (typeof data === 'string') {
            return data;
        } else {
            // Handle field-specific errors
            const fieldErrors = [];
            for (const [field, errors] of Object.entries(data)) {
                if (Array.isArray(errors)) {
                    fieldErrors.push(`${field}: ${errors.join(', ')}`);
                } else if (typeof errors === 'string') {
                    fieldErrors.push(`${field}: ${errors}`);
                }
            }
            if (fieldErrors.length > 0) {
                return fieldErrors.join('; ');
            }
            return JSON.stringify(data);
        }
    }

    if (error.message) {
        return error.message;
    }

    return 'An unexpected error occurred';
};

export {API_BASE_URL, apiClient};
export default apiClient;
