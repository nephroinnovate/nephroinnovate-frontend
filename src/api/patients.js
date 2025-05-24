import apiClient from './config';
import {
    normalizeListResponse,
    handleApiError,
    buildFHIRHumanName,
    extractHumanName,
    buildFHIRContactPoint,
    extractContactPoint,
    FHIR_RESOURCE_TYPES,
    createCachedApiCall
} from './helpers';
import {logResourceAccess} from '../utils/auditLogger';

// Transform frontend patient data to FHIR format for backend
const transformToFHIR = (patientData) => {
  const fhirData = {
    resourceType: FHIR_RESOURCE_TYPES.patient,
    active: patientData.active !== false,
    gender: patientData.gender,
    birth_date: patientData.date_of_birth || patientData.birth_date
  };

  // Handle name using helper
  if (patientData.first_name || patientData.last_name) {
    fhirData.name = buildFHIRHumanName(patientData.first_name, patientData.last_name);
  }

  // Handle identifiers (medical record number)
  if (patientData.medical_record_number) {
    fhirData.identifier = [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR'
            }
          ]
        },
        value: patientData.medical_record_number
      }
    ];
  }

  // Handle telecom (phone and email) using helpers
  if (patientData.contact_number || patientData.phone || patientData.email) {
    fhirData.telecom = [];
    if (patientData.contact_number || patientData.phone) {
      fhirData.telecom.push(buildFHIRContactPoint(patientData.contact_number || patientData.phone, 'phone'));
    }
    if (patientData.email) {
      fhirData.telecom.push(buildFHIRContactPoint(patientData.email, 'email'));
    }
  }

  // Handle managing organization (institution)
  if (patientData.institution_id) {
    fhirData.managingOrganization = {
      reference: `Organization/${patientData.institution_id}`,
      display: patientData.institution_name || 'Organization'
    };
  }

  // Copy other fields that might exist
  if (patientData.primary_diagnosis) {
    // This would normally be stored in a Condition resource
    // For now, we'll store it in extension
    fhirData.extension = [
      {
        url: 'http://example.org/primary-diagnosis',
        valueString: patientData.primary_diagnosis
      }
    ];
  }

  // Handle additional fields through extensions
  if (!fhirData.extension) {
    fhirData.extension = [];
  }

  if (patientData.dialysis_start_date) {
    fhirData.extension.push({
      url: 'http://example.org/dialysis-start-date',
      valueDate: patientData.dialysis_start_date
    });
  }

  if (patientData.insurance_info) {
    fhirData.extension.push({
      url: 'http://example.org/insurance-info',
      valueString: patientData.insurance_info
    });
  }

  return fhirData;
};

// Transform FHIR patient data to frontend format
const transformFromFHIR = (fhirData) => {
  // Extract names using helper
  const { firstName, lastName } = extractHumanName(fhirData.name);

  const patientData = {
    id: fhirData.id,
    active: fhirData.active,
    gender: fhirData.gender,
    date_of_birth: fhirData.birth_date || fhirData.birthDate,
    birth_date: fhirData.birth_date || fhirData.birthDate,
    // Use the computed properties from backend
    first_name: fhirData.first_name || firstName,
    last_name: fhirData.last_name || lastName,
    medical_record_number: fhirData.medical_record_number || '',
    primary_diagnosis: fhirData.primary_diagnosis || '',
    dialysis_start_date: fhirData.dialysis_start_date || '',
    insurance_info: fhirData.insurance_info || '',
    created_at: fhirData.created_at,
    updated_at: fhirData.updated_at,
    resourceType: fhirData.resourceType,
    institution_id: '' // Initialize institution_id
  };

  // Extract managing organization
  if (fhirData.managingOrganization && fhirData.managingOrganization.reference) {
    const parts = fhirData.managingOrganization.reference.split('/');
    if (parts.length > 1 && parts[0] === 'Organization') {
      patientData.institution_id = parts[1];
      patientData.institution_name = fhirData.managingOrganization.display || '';
    }
  }

  // Extract phone and email using helper
  patientData.contact_number = extractContactPoint(fhirData.telecom, 'phone') || '';
  patientData.phone = patientData.contact_number;
  patientData.email = extractContactPoint(fhirData.telecom, 'email') || '';

  // Extract data from extensions
  if (fhirData.extension && Array.isArray(fhirData.extension)) {
    fhirData.extension.forEach((ext) => {
      switch (ext.url) {
        case 'http://example.org/primary-diagnosis':
          patientData.primary_diagnosis = ext.valueString || patientData.primary_diagnosis;
          break;
        case 'http://example.org/dialysis-start-date':
          patientData.dialysis_start_date = ext.valueDate || patientData.dialysis_start_date;
          break;
        case 'http://example.org/insurance-info':
          patientData.insurance_info = ext.valueString || patientData.insurance_info;
          break;
      }
    });
  }

  return patientData;
};

const patientsApi = {
    getAllPatients: async (page = 1, limit = 10) => {
        try {
            const response = await apiClient.get('/patients/', {
                params: {page, page_size: limit}
            });

            const normalized = normalizeListResponse(response);
            return {
                ...normalized,
                items: normalized.items.map(transformFromFHIR)
            };
        } catch (error) {
            throw handleApiError(error, 'getAllPatients');
        }
    },

    getPatient: async (patientId) => {
        try {
            console.log('Fetching patient with ID:', patientId);
            const response = await apiClient.get(`/patients/${patientId}/`);
            const patient = transformFromFHIR(response.data);

            // Log access
            logResourceAccess('Patient', patientId, 'read');

            return patient;
        } catch (error) {
            throw handleApiError(error, 'getPatient');
        }
    },

    createPatient: async (patientData) => {
        try {
            const fhirData = transformToFHIR(patientData);
            const response = await apiClient.post('/patients/', fhirData);
            const patient = transformFromFHIR(response.data);

            // Log creation
            logResourceAccess('Patient', patient.id, 'create');

            return patient;
        } catch (error) {
            throw handleApiError(error, 'createPatient');
        }
    },

    updatePatient: async (patientId, patientData) => {
        try {
            const fhirData = transformToFHIR(patientData);
            const response = await apiClient.patch(`/patients/${patientId}/`, fhirData);
            const patient = transformFromFHIR(response.data);

            // Log update
            logResourceAccess('Patient', patientId, 'update');

            return patient;
        } catch (error) {
            throw handleApiError(error, 'updatePatient');
        }
    },

    deletePatient: async (patientId) => {
        try {
            const response = await apiClient.delete(`/patients/${patientId}/`);

            // Log deletion
            logResourceAccess('Patient', patientId, 'delete');

            return response.data;
        } catch (error) {
            throw handleApiError(error, 'deletePatient');
        }
    },

    // Search patients with FHIR parameters
    searchPatients: async (searchParams) => {
        try {
            const response = await apiClient.get('/patients/search', {
                params: searchParams
            });

            // Handle FHIR Bundle response
            if (response.data.resourceType === 'Bundle') {
                return {
                    items: response.data.entry ?
                        response.data.entry.map(e => transformFromFHIR(e.resource)) : [],
                    total: response.data.total || 0
                };
            }

            const normalized = normalizeListResponse(response);
            return {
                ...normalized,
                items: normalized.items.map(transformFromFHIR)
            };
        } catch (error) {
            throw handleApiError(error, 'searchPatients');
        }
    },

    // Validate patient data against FHIR standards
    validatePatient: async (patientData) => {
        try {
            const fhirData = transformToFHIR(patientData);
            const response = await apiClient.post('/patients/validate_fhir/', fhirData);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'validatePatient');
        }
    },

    // Bulk import patients
    bulkImportPatients: async (patientsData) => {
        try {
            const fhirDataArray = patientsData.map(transformToFHIR);
            const response = await apiClient.post('/patients/bulk_import/', fhirDataArray);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'bulkImportPatients');
        }
    },

    getAllInstitutions: createCachedApiCall(
        async () => {
            try {
                const response = await apiClient.get('/organizations/');
                return normalizeListResponse(response);
            } catch (error) {
                throw handleApiError(error, 'getAllInstitutions');
            }
        },
        'institutions',
        10 * 60 * 1000 // 10 minutes cache
    )
};

export default patientsApi;
