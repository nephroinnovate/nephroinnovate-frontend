import axios from 'axios';
import {API_BASE_URL, getAuthorizedHeaders, parseErrorResponse, normalizeFieldNames, encodeQueryParams} from './config';

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

const institutionsApi = {
    getAllInstitutions: async (page = 1, pageSize = 10) => {
        try {
            const api = getApi();
            const response = await api.get(`/institutions${encodeQueryParams({page, page_size: pageSize})}`);
            return normalizePaginationResponse(response.data);
        } catch (error) {
            console.error('Error fetching institutions:', error);
            if (error.response && error.response.status === 401) {
                console.warn('Authentication error when fetching institutions - user may need to log in');
                return {items: [], total: 0};
            }
            throw new Error(parseErrorResponse(error));
        }
    },

    getInstitution: async (institutionId) => {
        try {
            const api = getApi();
            const response = await api.get(`/institutions/${institutionId}`);
            return normalizeFieldNames(response.data);
        } catch (error) {
            console.error('Error fetching institution:', error);
            if (error.response && error.response.status === 401) {
                console.warn('Authentication error when fetching institution - user may need to log in');
                return null;
            }
            throw new Error(parseErrorResponse(error));
        }
    },

    createInstitution: async (institutionData) => {
        try {
            console.log('Creating institution with data:', institutionData);
            const api = getApi();
            const response = await api.post('/institutions', institutionData);
            return normalizeFieldNames(response.data);
        } catch (error) {
            console.error('Create institution error:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    updateInstitution: async (institutionId, institutionData) => {
        try {
            console.log(`Updating institution ${institutionId} with data:`, institutionData);
            const api = getApi();
            const response = await api.patch(`/institutions/${institutionId}`, institutionData);
            return normalizeFieldNames(response.data);
        } catch (error) {
            console.error('Update institution error:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    deleteInstitution: async (institutionId) => {
        try {
            const api = getApi();
            await api.delete(`/institutions/${institutionId}`);
            return true;
        } catch (error) {
            console.error('Error deleting institution:', error);
            throw new Error(parseErrorResponse(error));
        }
    }
};

export default institutionsApi;