import axios from 'axios';
import {API_BASE_URL, getAuthorizedHeaders} from './config';

// Create an axios instance with multipart/form-data content type for file uploads
const getUploadApi = () => {
    const headers = getAuthorizedHeaders();
    // Remove Content-Type so axios can set it properly with boundary for multipart/form-data
    delete headers['Content-Type'];

    return axios.create({
        baseURL: API_BASE_URL,
        headers
    });
};

const uploadsApi = {
    /**
     * Upload a file to the server
     * @param {File} file - The file to upload
     * @param {Object} metadata - Additional metadata to include with the file
     * @param {string} endpoint - The API endpoint to upload to (e.g., '/users/avatar')
     * @returns {Promise<Object>} - The server response
     */
    uploadFile: async (file, metadata = {}, endpoint) => {
        try {
            // Create a FormData object to hold the file and metadata
            const formData = new FormData();
            formData.append('file', file);

            // Add any additional metadata as form fields
            Object.entries(metadata).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    // Convert objects to JSON strings
                    if (typeof value === 'object' && !(value instanceof File)) {
                        formData.append(key, JSON.stringify(value));
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            const api = getUploadApi();
            const response = await api.post(endpoint, formData);
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw new Error(error.response?.data?.message || 'Failed to upload file');
        }
    },

    /**
     * Upload a user avatar
     * @param {File} file - The image file to upload
     * @param {string} userId - The ID of the user
     * @returns {Promise<Object>} - The server response
     */
    uploadAvatar: async (file, userId) => {
        return uploadsApi.uploadFile(file, {user_id: userId}, '/users/avatar');
    },

    /**
     * Upload a patient photo
     * @param {File} file - The image file to upload
     * @param {string} patientId - The ID of the patient
     * @returns {Promise<Object>} - The server response
     */
    uploadPatientPhoto: async (file, patientId) => {
        return uploadsApi.uploadFile(file, {patient_id: patientId}, '/patients/photo');
    },

    /**
     * Upload a document
     * @param {File} file - The document to upload
     * @param {Object} metadata - Document metadata (type, category, etc.)
     * @returns {Promise<Object>} - The server response
     */
    uploadDocument: async (file, metadata = {}) => {
        return uploadsApi.uploadFile(file, metadata, '/documents');
    }
};

export default uploadsApi;