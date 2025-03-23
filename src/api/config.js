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
  development: '/api',
  // In production, use the full URL
  production: 'https://nephroinnovate-api-ultra-minimal-fpgdfabhc7c9egej.swedencentral-01.azurewebsites.net'
};

// Get current environment, default to production if on Azure
const ENV = isAzureStaticWebApp ? 'production' : (process.env.NODE_ENV || 'development');

// For Azure Static Web Apps, we want to use the API proxy route defined in staticwebapp.config.json
const API_BASE_URL = isAzureStaticWebApp
  ? '/api'
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
      Authorization: `Bearer ${token}`
    };
  }

  return {};
};

// Handle authentication errors by redirecting to login
export const handleAuthError = () => {
  // Clear stored credentials
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');

  // Always redirect to root (login page)
  window.location.href = '/';
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
