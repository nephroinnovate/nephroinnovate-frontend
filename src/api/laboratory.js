import apiClient from './config';
import {
    normalizeListResponse,
    handleApiError,
    formatFHIRDateTime,
    FHIR_RESOURCE_TYPES,
    createFieldMapper
} from './helpers';

// Field mapping for laboratory results
const labFieldMapper = createFieldMapper({
    date: 'test_date',
    test_date: 'test_date',
    hemodialysis_session_id: 'hemodialysis_session_id',
    patient_id: 'patient_id',
    hemoglobin: 'hemoglobin',
    hematocrit: 'hematocrit',
    potassium: 'potassium',
    creatinine: 'creatinine',
    urea: 'urea',
    phosphorus: 'phosphorus',
    calcium: 'calcium',
    albumin: 'albumin',
    kt_v: 'kt_v'
});

// Transform lab result to FHIR Observation format
const transformToFHIRObservation = (labData, type, value, unit) => {
    return {
        resourceType: FHIR_RESOURCE_TYPES.observation,
        status: 'final',
        code: {
            coding: [{
                system: 'http://loinc.org',
                code: getLoincCode(type),
                display: type
            }]
        },
        subject: {
            reference: `Patient/${labData.patient_id}`
        },
        effectiveDateTime: formatFHIRDateTime(labData.test_date || labData.date),
        valueQuantity: {
            value: value,
            unit: unit,
            system: 'http://unitsofmeasure.org'
        }
    };
};

// Get LOINC codes for common lab tests
const getLoincCode = (testType) => {
    const loincCodes = {
        hemoglobin: '718-7',
        hematocrit: '4544-3',
        potassium: '2823-3',
        creatinine: '2160-0',
        urea: '3094-0',
        phosphorus: '2777-1',
        calcium: '17861-6',
        albumin: '1751-7'
    };
    return loincCodes[testType.toLowerCase()] || 'unknown';
};

const laboratoryApi = {
    getLabResultsByPatient: async (patientId) => {
        try {
            const response = await apiClient.get('/laboratory-results/', {
                params: {patient_id: patientId}
            });

            return normalizeListResponse(response);
        } catch (error) {
            throw handleApiError(error, 'getLabResultsByPatient');
        }
    },

    getLabResultsBySession: async (sessionId) => {
        try {
            const response = await apiClient.get('/laboratory-results/', {
                params: {session_id: sessionId}
            });

            return normalizeListResponse(response);
        } catch (error) {
            throw handleApiError(error, 'getLabResultsBySession');
        }
    },

    getLabResult: async (resultId) => {
        try {
            const response = await apiClient.get(`/laboratory-results/${resultId}/`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getLabResult');
        }
    },

    createLabResult: async (resultData) => {
        try {
            const formattedData = labFieldMapper.toBackend(resultData);

            // Ensure date is properly formatted
            if (formattedData.test_date) {
                formattedData.test_date = formatFHIRDateTime(formattedData.test_date);
            }

            const response = await apiClient.post('/laboratory-results/', formattedData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'createLabResult');
        }
    },

    updateLabResult: async (resultId, resultData) => {
        try {
            const formattedData = labFieldMapper.toBackend(resultData);

            // Ensure date is properly formatted
            if (formattedData.test_date) {
                formattedData.test_date = formatFHIRDateTime(formattedData.test_date);
            }

            const response = await apiClient.patch(`/laboratory-results/${resultId}/`, formattedData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updateLabResult');
        }
    },

    deleteLabResult: async (resultId) => {
        try {
            await apiClient.delete(`/laboratory-results/${resultId}/`);
            return {success: true, message: 'Lab result deleted successfully'};
        } catch (error) {
            throw handleApiError(error, 'deleteLabResult');
        }
    },

    // Get lab results as FHIR Observations
    getLabResultsAsFHIR: async (patientId) => {
        try {
            const response = await apiClient.get('/laboratory-results/', {
                params: {patient_id: patientId, format: 'fhir'}
            });

            // If backend returns FHIR Bundle
            if (response.data.resourceType === 'Bundle') {
                return response.data;
            }

            // Otherwise, transform to FHIR format
            const results = normalizeListResponse(response);
            const observations = [];

            results.items.forEach(lab => {
                // Create observation for each lab value
                if (lab.hemoglobin) {
                    observations.push(transformToFHIRObservation(lab, 'hemoglobin', lab.hemoglobin, 'g/dL'));
                }
                if (lab.hematocrit) {
                    observations.push(transformToFHIRObservation(lab, 'hematocrit', lab.hematocrit, '%'));
                }
                if (lab.potassium) {
                    observations.push(transformToFHIRObservation(lab, 'potassium', lab.potassium, 'mmol/L'));
                }
                if (lab.creatinine) {
                    observations.push(transformToFHIRObservation(lab, 'creatinine', lab.creatinine, 'mg/dL'));
                }
                if (lab.urea) {
                    observations.push(transformToFHIRObservation(lab, 'urea', lab.urea, 'mg/dL'));
                }
                if (lab.phosphorus) {
                    observations.push(transformToFHIRObservation(lab, 'phosphorus', lab.phosphorus, 'mg/dL'));
                }
                if (lab.calcium) {
                    observations.push(transformToFHIRObservation(lab, 'calcium', lab.calcium, 'mg/dL'));
                }
                if (lab.albumin) {
                    observations.push(transformToFHIRObservation(lab, 'albumin', lab.albumin, 'g/dL'));
                }
            });

            return {
                resourceType: 'Bundle',
                type: 'collection',
                total: observations.length,
                entry: observations.map(obs => ({resource: obs}))
            };
        } catch (error) {
            throw handleApiError(error, 'getLabResultsAsFHIR');
        }
    },

    // Get lab trends for a specific test type
    getLabTrends: async (patientId, testType, days = 30) => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const response = await apiClient.get('/laboratory-results/', {
                params: {
                    patient_id: patientId,
                    test_date__gte: formatFHIRDateTime(startDate),
                    test_date__lte: formatFHIRDateTime(endDate)
                }
            });

            const results = normalizeListResponse(response);

            // Extract trend data for the specific test type
            return results.items
                .filter(lab => lab[testType] !== null && lab[testType] !== undefined)
                .map(lab => ({
                    date: lab.test_date,
                    value: lab[testType]
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            throw handleApiError(error, 'getLabTrends');
        }
    }
};

export default laboratoryApi;
