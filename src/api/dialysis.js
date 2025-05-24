import apiClient from './config';
import {normalizeListResponse, handleApiError, formatFHIRDateTime} from './helpers';

// Field mapping for dialysis sessions
const sessionFieldMapping = {
    session_date: 'session_date',
    duration_minutes: 'duration_minutes',
    pre_weight: 'pre_weight',
    post_weight: 'post_weight',
    blood_flow_rate: 'blood_flow_rate',
    dialysate_flow_rate: 'dialysate_flow_rate',
    complications: 'complications',
    attending_staff: 'attending_staff',
    patient_id: 'patient_id'
};

// Transform session data for backend
const transformSessionForBackend = (sessionData) => {
    const transformed = {};

    Object.entries(sessionFieldMapping).forEach(([frontend, backend]) => {
        if (sessionData[frontend] !== undefined) {
            transformed[backend] = sessionData[frontend];
        }
    });

    // Ensure dates are properly formatted
    if (transformed.session_date) {
        transformed.session_date = formatFHIRDateTime(transformed.session_date);
    }

    return transformed;
};

const dialysisApi = {
    getSessionsByPatient: async (patientId, page = 1, pageSize = 10) => {
        try {
            const response = await apiClient.get('/hemodialysis-sessions/', {
                params: {patient_id: patientId, page, page_size: pageSize}
            });

            return normalizeListResponse(response);
        } catch (error) {
            throw handleApiError(error, 'getSessionsByPatient');
        }
    },

    getSessionById: async (sessionId) => {
        try {
            const response = await apiClient.get(`/hemodialysis-sessions/${sessionId}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSessionById');
        }
    },

    createSession: async (sessionData) => {
        try {
            const transformedData = transformSessionForBackend(sessionData);
            const response = await apiClient.post('/hemodialysis-sessions/', transformedData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'createSession');
        }
    },

    updateSession: async (sessionId, sessionData) => {
        try {
            const transformedData = transformSessionForBackend(sessionData);
            const response = await apiClient.patch(`/hemodialysis-sessions/${sessionId}/`, transformedData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updateSession');
        }
    },

    deleteSession: async (sessionId) => {
        try {
            await apiClient.delete(`/hemodialysis-sessions/${sessionId}/`);
            return {success: true, message: 'Session deleted successfully'};
        } catch (error) {
            throw handleApiError(error, 'deleteSession');
        }
    },

    // Get sessions by date range
    getSessionsByDateRange: async (patientId, startDate, endDate) => {
        try {
            const response = await apiClient.get('/hemodialysis-sessions/', {
                params: {
                    patient_id: patientId,
                    session_date__gte: formatFHIRDateTime(startDate),
                    session_date__lte: formatFHIRDateTime(endDate)
                }
            });

            return normalizeListResponse(response);
        } catch (error) {
            throw handleApiError(error, 'getSessionsByDateRange');
        }
    },

    // Get session statistics for a patient
    getSessionStatistics: async (patientId) => {
        try {
            const response = await apiClient.get(`/hemodialysis-sessions/statistics/`, {
                params: {patient_id: patientId}
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSessionStatistics');
        }
    },

    // Batch create sessions
    batchCreateSessions: async (sessionsData) => {
        try {
            const transformedData = sessionsData.map(transformSessionForBackend);
            const response = await apiClient.post('/hemodialysis-sessions/batch/', transformedData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'batchCreateSessions');
        }
    }
};

export default dialysisApi;
