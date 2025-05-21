// Simple API configuration for different environments

// Check if we're in an Azure Static Web App environment
const isAzureStaticWebApp = typeof window !== 'undefined' &&
                           window.location &&
                           window.location.hostname.includes('azurestaticapps.net');

// Debug mode can be enabled with VITE_DEBUG environment variable
const isDebugMode = import.meta.env?.VITE_DEBUG === 'true';

// Default API URLs for different environments
const API_URLS = {
  // In development, use the proxy path to avoid CORS issues
    development: '/api/v1',
  // In production, use the full URL
    production: 'https://nephroinnovate-gxa8csfucvahhvb8.swedencentral-01.azurewebsites.net/api/v1'
};

// Get current environment, default to production if on Azure
const ENV = isAzureStaticWebApp ? 'production' : (process.env.NODE_ENV || 'development');

// For Azure Static Web Apps, we want to use the API proxy route defined in staticwebapp.config.json
const API_BASE_URL = isAzureStaticWebApp
    ? '/api/v1'
  : API_URLS[ENV];

// Log the API URL being used (helpful for debugging)
console.log(`API config: Using ${ENV} environment with base URL: ${API_BASE_URL}`);

// Check if token is currently valid
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // JWT tokens are in format: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;

    // Base64Url decode
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));

    // Check expiration
    const expirationTime = payload.exp * 1000; // Convert seconds to milliseconds
    return Date.now() < expirationTime;
  } catch (error) {
    console.error('Error checking token validity', error);
    return false;
  }
};

// Helper function to get authorized axios headers
export const getAuthorizedHeaders = () => {
  const token = localStorage.getItem('token');

  // Always include the token if it exists, regardless of validity
  // The backend will reject invalid tokens and our axios interceptors will handle the error
  if (token) {
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
  }

    return {
        'Content-Type': 'application/json'
    };
};

// Create a consistent API client factory
export const createApiClient = (options = {}) => {
    const {
        removeContentType = false,     // For file uploads
        baseUrl = API_BASE_URL,        // Allow custom base URL
        withCredentials = false,       // For CORS with credentials
        timeout = 30000                // Default timeout
    } = options;

    const headers = getAuthorizedHeaders();

    // For file uploads, don't set Content-Type so Axios can set it with boundary
    if (removeContentType) {
        delete headers['Content-Type'];
    }

    // Create axios instance with consistent configuration
    const client = axios.create({
        baseURL: baseUrl,
        headers,
        withCredentials,
        timeout
    });

    // Add interceptors for error handling
    client.interceptors.request.use(
        config => {
            // Sanitize request data to handle special JS values
            if (config.data) {
                config.data = sanitizeData(config.data);
            }
            return config;
        },
        error => Promise.reject(error)
    );

    client.interceptors.response.use(
        response => response,
        error => {
            // Handle 401 errors centrally
            if (error.response && error.response.status === 401) {
                // Only handle auth errors if we're not already on an auth page
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                    console.warn('Authentication error received - attempting token refresh');
                    return refreshToken().then(success => {
                        if (success) {
                            // Try the request again with new token
                            const token = localStorage.getItem('token');
                            const originalRequest = error.config;
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            return axios(originalRequest);
                        }

                        // Token refresh failed, proceed with regular error handling
                        return Promise.reject(error);
                    });
                }
            }
            return Promise.reject(error);
        }
    );

    return client;
};

// Handle token refresh logic
export const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({refresh: refreshToken}),
        });

        if (!response.ok) {
            throw new Error('Token refresh failed');
        }

        const data = await response.json();

        // Save the new tokens
        localStorage.setItem('token', data.access);
        if (data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
        }

        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
};

// Handle authentication errors by redirecting to login
export const handleAuthError = () => {
    // Try to refresh the token first
    refreshToken().then(success => {
        if (!success) {
            // Clear stored credentials
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('relatedEntityId');

        // Always redirect to root (login page)
        window.location.href = '/';
    }
  });
};

// Standardize error response parsing
export const parseErrorResponse = (error) => {
    if (error.response && error.response.data) {
        if (error.response.data.message) {
            return error.response.data.message;
        } else if (error.response.data.error) {
            return error.response.data.error;
        } else if (typeof error.response.data === 'string') {
            return error.response.data;
        } else {
            return JSON.stringify(error.response.data);
        }
    }
    return 'An unexpected error occurred';
};

// Standardize boolean values - handle different representations
export const normalizeBooleanField = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'boolean') {
        return value;
    }

    // Handle string values
    if (typeof value === 'string') {
        const lowered = value.toLowerCase().trim();
        if (lowered === 'true' || lowered === 'yes' || lowered === '1' || lowered === 'y') {
            return true;
        }
        if (lowered === 'false' || lowered === 'no' || lowered === '0' || lowered === 'n') {
            return false;
        }
    }

    // Handle numeric values
    if (typeof value === 'number') {
        return value !== 0;
    }

    // Default to null if can't determine
    return null;
};

// Standardize numeric values for precision issues between JavaScript and Python
export const normalizeNumber = (value, precision = 10) => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string') {
        // Try to convert string to number
        try {
            value = Number(value);
        } catch (e) {
            console.warn('Failed to convert string to number:', value);
            return value;
        }
    }

    if (typeof value === 'number') {
        // Handle NaN and Infinity
        if (isNaN(value) || !isFinite(value)) {
            return null;
        }

        // Fix precision issues by rounding to specific decimal places
        // This helps with decimal precision differences between JS and backend
        return Number(value.toFixed(precision));
    }

    return value;
};

// Convert arrays from backend to frontend-friendly format
export const normalizeArrayField = (value) => {
    if (value === null || value === undefined) {
        return [];
    }

    if (typeof value === 'string') {
        try {
            // Try to parse JSON string as array
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            // If it's a comma-separated string, split it
            if (value.includes(',')) {
                return value.split(',').map(item => item.trim());
            }
            // Otherwise return a single-item array
            return [value];
        }
    }

    if (Array.isArray(value)) {
        return value;
    }

    // If it's an object with numeric keys, convert to array
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
            return Object.values(value);
        }
    }

    // Return a single-item array with the value
    return [value];
};

// Safe URL parameter encoding for API requests
export const encodeQueryParams = (params) => {
    const encodedParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            // Handle array parameters
            value.forEach(item => {
                if (item !== null && item !== undefined) {
                    encodedParams.append(key, item.toString());
                }
            });
        } else if (typeof value === 'object' && value instanceof Date) {
            // Handle Date objects
            encodedParams.set(key, formatDateTimeForAPI(value));
        } else if (typeof value === 'object') {
            // JSON stringify objects
            encodedParams.set(key, JSON.stringify(value));
        } else {
            // Simple values
            encodedParams.set(key, value.toString());
        }
    }

    return encodedParams.toString();
};

// Function to handle timeZone differences between frontend and backend
export const normalizeTimezone = (dateValue, useUtc = true) => {
    if (!dateValue) return null;

    try {
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

        // Ensure it's a valid date
        if (isNaN(date.getTime())) {
            return null;
        }

        if (useUtc) {
            // Convert to UTC for backend storage to prevent timezone issues
            const year = date.getUTCFullYear();
            const month = date.getUTCMonth();
            const day = date.getUTCDate();
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const seconds = date.getUTCSeconds();
            const ms = date.getUTCMilliseconds();

            // Create a new date using UTC components but in local time
            const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, seconds, ms));
            return utcDate.toISOString();
        } else {
            // Use local timezone but in ISO format
            return date.toISOString();
        }
    } catch (error) {
        console.error('Error normalizing timezone:', error);
        return null;
    }
};

// Standardize date formatting
export const formatDate = (dateValue) => {
    if (!dateValue) return null;
    try {
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        return date.toISOString();
  } catch (error) {
      console.error('Error formatting date:', error);
      return null;
  }
};

// Extract CSRF token from cookies if present (for non-API views that might require it)
export const getCsrfToken = () => {
    try {
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1] || '';
    } catch (error) {
        console.warn('Error extracting CSRF token:', error);
        return '';
    }
};

// Sanitize data before sending to API to handle special JavaScript values
export const sanitizeData = (data) => {
    if (data === undefined) {
        return null;
    }

    if (data === null) {
        return null;
    }

    if (typeof data === 'number') {
        // Handle NaN and Infinity which don't serialize well to JSON
        if (Number.isNaN(data) || !Number.isFinite(data)) {
            return null;
        }
        return data;
    }

    if (typeof data === 'object') {
        // Handle arrays
        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item));
        }

        // Handle Date objects
        if (data instanceof Date) {
            // Check if valid date
            return isNaN(data.getTime()) ? null : data;
        }

        // Handle regular objects
        const result = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = sanitizeData(value);
        }
        return result;
    }

    // Return strings, booleans and other primitives as is
    return data;
};

// Format date for API request (YYYY-MM-DDTHH:MM:SS format)
export const formatDateTimeForAPI = (dateValue) => {
    if (!dateValue) return null;
    try {
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        return date.toISOString();
    } catch (error) {
        console.error('Error formatting date for API:', error);
        return null;
    }
};

// Format date for API request (YYYY-MM-DD format - for date-only fields)
export const formatDateOnlyForAPI = (dateValue) => {
    if (!dateValue) return null;
    try {
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date for API:', error);
        return null;
    }
};

// Parse dates from API responses
export const parseDateFields = (data, dateFields = [
    'created_at', 'updated_at', 'birth_date', 'date',
    'test_date', 'session_date', 'start_date', 'end_date'
]) => {
    if (!data) return data;

    if (Array.isArray(data)) {
        return data.map(item => parseDateFields(item, dateFields));
    }

    if (typeof data === 'object') {
        const result = {...data};
        for (const field of dateFields) {
            if (result[field]) {
                try {
                    result[field] = new Date(result[field]);
                } catch (error) {
                    console.warn(`Failed to parse date for field ${field}:`, error);
                }
            }

            // Also check camelCase variants of the field
            const camelCaseField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            if (result[camelCaseField] && field !== camelCaseField) {
                try {
                    result[camelCaseField] = new Date(result[camelCaseField]);
                } catch (error) {
                    console.warn(`Failed to parse date for field ${camelCaseField}:`, error);
                }
            }
    }
      return result;
  }

    return data;
};

// Helper to normalize field names between frontend and backend
export const normalizeFieldNames = (data, options = {addSnakeCase: true, addCamelCase: true, fieldsMap: {}}) => {
    if (!data || typeof data !== 'object') return data;

    // Handle arrays by mapping each item
    if (Array.isArray(data)) {
        return data.map(item => normalizeFieldNames(item, options));
    }

    const result = {...data};
    const {addSnakeCase, addCamelCase, fieldsMap} = options;

    // Handle ID fields - ensure they're strings for consistency
    if (result.id !== undefined) {
        result.id = String(result.id);
    }

    // Handle other common ID fields
    const idFields = ['patient_id', 'patientId', 'user_id', 'userId', 'session_id', 'sessionId', 'institution_id', 'institutionId'];

    for (const field of idFields) {
        if (result[field] !== undefined && result[field] !== null) {
            result[field] = String(result[field]);
        }
    }

    // Apply custom field mappings first
    for (const [fromField, toField] of Object.entries(fieldsMap)) {
        if (fromField in result && !(toField in result)) {
            result[toField] = result[fromField];
        }
    }

    // Add snake_case variants of camelCase fields
    if (addSnakeCase) {
        for (const [key, value] of Object.entries(result)) {
            if (key.match(/[a-z][A-Z]/)) {  // Contains camelCase
                const snakeKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
                if (!(snakeKey in result)) {
                    result[snakeKey] = value;
                }
            }
        }
    }

    // Add camelCase variants of snake_case fields
    if (addCamelCase) {
        for (const [key, value] of Object.entries(result)) {
            if (key.includes('_')) {  // Contains snake_case
                const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
                if (!(camelKey in result)) {
                    result[camelKey] = value;
                }
            }
        }
    }

    // Handle null vs undefined consistency - convert undefined to null for JSON compatibility
    for (const key in result) {
        if (result[key] === undefined) {
            result[key] = null;
      }
    }

    // Handle empty string vs null for API compatibility
    // Some APIs treat empty strings as valid values while others expect null
    const stringFields = ['firstName', 'first_name', 'lastName', 'last_name', 'email', 'phone', 'description'];
    for (const field of stringFields) {
        if (result[field] === '') {
            // Keep empty strings for these fields, as they might be intentionally cleared
        } else if (result[field] === null || result[field] === undefined) {
            // Make sure we have null instead of undefined for JSON serialization
            result[field] = null;
        }
    }

    // Handle boolean field normalization
    const booleanFields = [
        'active', 'is_active', 'isActive',
        'enabled', 'is_enabled', 'isEnabled',
        'notifications_enabled', 'notificationsEnabled',
        'deceased_boolean', 'deceasedBoolean',
        'multiple_birth_boolean', 'multipleBirthBoolean'
    ];

    for (const field of booleanFields) {
        if (field in result) {
            result[field] = normalizeBooleanField(result[field]);
        }
    }

    // Handle numeric field normalization
    const numericFields = [
        'weight', 'pre_weight', 'preWeight', 'post_weight', 'postWeight',
        'height', 'blood_flow_rate', 'bloodFlowRate', 'dialysate_flow_rate', 'dialysateFlowRate',
        'hemoglobin', 'hematocrit', 'potassium', 'creatinine', 'urea',
        'phosphorus', 'calcium', 'albumin', 'kt_v', 'ktV',
        'duration_minutes', 'durationMinutes'
    ];

    for (const field of numericFields) {
        if (field in result) {
            result[field] = normalizeNumber(result[field]);
        }
    }

    // Handle array field normalization
    const arrayFields = [
        'identifier', 'name', 'address', 'telecom', 'contact', 'communication',
        'general_practitioner', 'generalPractitioner', 'tags'
    ];

    for (const field of arrayFields) {
        if (field in result) {
            result[field] = normalizeArrayField(result[field]);
        }
    }

    return result;
};

if (isDebugMode) {
  console.log('Debug mode enabled');
  console.log('Environment variables:', import.meta.env);
  console.log('isAzureStaticWebApp:', isAzureStaticWebApp);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('API Base URL:', API_BASE_URL);
  console.log('Token:', localStorage.getItem('token') ? '✓ Present' : 'ⅹ Missing');
  console.log('User Role:', localStorage.getItem('userRole'));
}

export { API_BASE_URL, isDebugMode };
