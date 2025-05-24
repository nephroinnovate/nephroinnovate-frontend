import {parseErrorResponse} from './config';

// Helper to ensure consistent response format
export const normalizeListResponse = (response) => {
  // Handle backend pagination response { items: [...], total: n }
  if (response.data.items !== undefined && response.data.total !== undefined) {
    return {
      items: response.data.items,
      total: response.data.total,
      page: response.data.page || 1,
      pageSize: response.data.pageSize || response.data.items.length
    };
  }

  // Handle pagination response
  if (response.data.results !== undefined) {
    return {
      items: response.data.results,
      total: response.data.count || response.data.results.length,
      page: response.data.page || 1,
      pageSize: response.data.page_size || response.data.results.length
    };
  }

  // Handle simple array response
  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      total: response.data.length,
      page: 1,
      pageSize: response.data.length
    };
  }

  // Handle single item response
  return {
    items: [response.data],
    total: 1,
    page: 1,
    pageSize: 1
  };
};

// FHIR resource type mapping
export const FHIR_RESOURCE_TYPES = {
    patient: 'Patient',
    organization: 'Organization',
    practitioner: 'Practitioner',
    observation: 'Observation',
    procedure: 'Procedure',
    medicationRequest: 'MedicationRequest'
};

// Helper to handle API errors consistently
export const handleApiError = (error, context = '') => {
    const errorMessage = parseErrorResponse(error);
    console.error(`Error in ${context}:`, error);

    // Check for specific error types
    if (error.response) {
        switch (error.response.status) {
            case 401:
                throw new Error('Authentication required. Please log in.');
            case 403:
                throw new Error('You do not have permission to perform this action.');
            case 404:
                throw new Error('The requested resource was not found.');
            case 409:
                throw new Error('A conflict occurred. The resource may already exist.');
            case 422:
                throw new Error('The data provided is invalid. Please check and try again.');
            default:
                throw new Error(errorMessage);
        }
    }

    throw new Error(errorMessage);
};

// FHIR date format helper
export const formatFHIRDate = (date) => {
    if (!date) return null;

    // If already a Date object
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }

    // If ISO string, extract date part
    if (typeof date === 'string' && date.includes('T')) {
        return date.split('T')[0];
    }

    // Return as is if already in YYYY-MM-DD format
    return date;
};

// FHIR datetime format helper
export const formatFHIRDateTime = (dateTime) => {
    if (!dateTime) return null;

    // If already a Date object
    if (dateTime instanceof Date) {
        return dateTime.toISOString();
    }

    // If date-only string, add time
    if (typeof dateTime === 'string' && !dateTime.includes('T')) {
        return new Date(dateTime).toISOString();
    }

    // Return as is if already in ISO format
    return dateTime;
};

// Helper to validate FHIR resource
export const validateFHIRResource = (resource, resourceType) => {
    const errors = [];

    // Check resource type
    if (resource.resourceType !== resourceType) {
        errors.push(`Resource type must be '${resourceType}'`);
    }

    // Basic validation for common FHIR fields
    switch (resourceType) {
        case 'Patient':
            if (!resource.gender) {
                errors.push('Gender is required for Patient resource');
            }
            if (resource.gender && !['male', 'female', 'other', 'unknown'].includes(resource.gender)) {
                errors.push('Gender must be one of: male, female, other, unknown');
            }
            break;

        case 'Organization':
            if (!resource.name) {
                errors.push('Name is required for Organization resource');
            }
            break;

        case 'Observation':
            if (!resource.status) {
                errors.push('Status is required for Observation resource');
            }
            if (!resource.code) {
                errors.push('Code is required for Observation resource');
            }
            break;
    }

    return errors;
};

// Helper to create FHIR Bundle
export const createFHIRBundle = (resources, bundleType = 'collection') => {
    return {
        resourceType: 'Bundle',
        type: bundleType,
        total: resources.length,
        entry: resources.map(resource => ({
            resource: resource,
            fullUrl: `urn:uuid:${resource.id || generateUUID()}`
        }))
    };
};

// Helper to generate UUID (for client-side resource creation)
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Helper to extract human-readable name from FHIR HumanName
export const extractHumanName = (nameArray) => {
    if (!nameArray || !Array.isArray(nameArray) || nameArray.length === 0) {
        return {firstName: '', lastName: ''};
    }

    const name = nameArray[0];
    return {
        firstName: Array.isArray(name.given) ? name.given.join(' ') : '',
        lastName: name.family || ''
    };
};

// Helper to build FHIR HumanName from first/last name
export const buildFHIRHumanName = (firstName, lastName, use = 'official') => {
    return [{
        use: use,
        given: firstName ? [firstName] : [],
        family: lastName || ''
    }];
};

// Helper to extract contact from FHIR ContactPoint
export const extractContactPoint = (telecomArray, system) => {
    if (!telecomArray || !Array.isArray(telecomArray)) {
        return null;
    }

    const contact = telecomArray.find(t => t.system === system);
    return contact ? contact.value : null;
};

// Helper to build FHIR ContactPoint
export const buildFHIRContactPoint = (value, system, use = 'home') => {
    return {
        system: system,
        value: value,
        use: use
    };
};

// Helper for consistent field mapping
export const createFieldMapper = (mappings) => {
    return {
        toBackend: (frontendData) => {
            const backendData = {};
            Object.entries(mappings).forEach(([frontendKey, backendKey]) => {
                if (frontendData[frontendKey] !== undefined) {
                    backendData[backendKey] = frontendData[frontendKey];
                }
            });
            return backendData;
        },

        fromBackend: (backendData) => {
            const frontendData = {};
            Object.entries(mappings).forEach(([frontendKey, backendKey]) => {
                if (backendData[backendKey] !== undefined) {
                    frontendData[frontendKey] = backendData[backendKey];
                }
            });
            return frontendData;
        }
    };
};

// Batch operation helper
export const batchOperation = async (items, operation, batchSize = 10) => {
    const results = [];
    const errors = [];

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const batchPromises = batch.map((item, index) =>
            operation(item)
                .then(result => ({success: true, result, index: i + index}))
                .catch(error => ({success: false, error, index: i + index}))
        );

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(({success, result, error, index}) => {
            if (success) {
                results.push({index, data: result});
            } else {
                errors.push({index, error: error.message});
            }
        });
    }

    return {results, errors, total: items.length};
};

// Cache helper for frequently accessed data
class SimpleCache {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + this.ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }
}

export const apiCache = new SimpleCache();

// Helper to create cached API calls
export const createCachedApiCall = (apiCall, cacheKey, ttl) => {
    return async (...args) => {
        const key = `${cacheKey}:${JSON.stringify(args)}`;
        const cached = apiCache.get(key);

        if (cached) {
            return cached;
        }

        const result = await apiCall(...args);
        apiCache.set(key, result);
        return result;
    };
};
