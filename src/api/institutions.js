import apiClient, {parseErrorResponse} from './config';

const institutionsApi = {
    getAllInstitutions: async (page = 1, pageSize = 10) => {
        try {
            const response = await apiClient.get('/organizations/', {
                params: {page, page_size: pageSize}
            });

            // Handle pagination response
            if (response.data.results) {
                return {
                    items: response.data.results,
                    total: response.data.count || response.data.results.length
                };
            }

            // Handle simple array response
            if (Array.isArray(response.data)) {
                return {
                    items: response.data,
                    total: response.data.length
                };
            }

            return {items: [], total: 0};
        } catch (error) {
            console.error('Error fetching institutions:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    getInstitution: async (institutionId) => {
        try {
            const response = await apiClient.get(`/organizations/${institutionId}/`);
            return response.data;
        } catch (error) {
            console.error('Error fetching institution:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    createInstitution: async (institutionData) => {
        try {
            console.log('Creating institution with data:', institutionData);
            const response = await apiClient.post('/organizations/', institutionData);
            return response.data;
        } catch (error) {
            console.error('Create institution error:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    updateInstitution: async (institutionId, institutionData) => {
        try {
            console.log(`Updating institution ${institutionId} with data:`, institutionData);
            const response = await apiClient.patch(`/organizations/${institutionId}/`, institutionData);
            return response.data;
        } catch (error) {
            console.error('Update institution error:', error);
            throw new Error(parseErrorResponse(error));
        }
    },

    deleteInstitution: async (institutionId) => {
        try {
            await apiClient.delete(`/organizations/${institutionId}/`);
            return true;
        } catch (error) {
            console.error('Error deleting institution:', error);
            throw new Error(parseErrorResponse(error));
        }
    }
};

export default institutionsApi;
