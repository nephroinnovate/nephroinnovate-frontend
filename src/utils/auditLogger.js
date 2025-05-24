// Audit logger for FHIR compliance
// Tracks all healthcare data access and modifications

class AuditLogger {
    constructor() {
        this.auditEvents = [];
        this.maxEvents = 1000; // Keep last 1000 events in memory
    }

    // Log a FHIR resource access event
    logAccess(resourceType, resourceId, action, userId, outcome = 'success') {
        const event = {
            timestamp: new Date().toISOString(),
            type: 'access',
            resourceType,
            resourceId,
            action, // read, create, update, delete
            userId: userId || localStorage.getItem('userId'),
            userRole: localStorage.getItem('userRole'),
            outcome,
            userAgent: navigator.userAgent,
            sessionId: this.getSessionId()
        };

        this.addEvent(event);

        // Send to backend audit log
        this.sendToBackend(event);
    }

    // Log data export event
    logExport(resourceType, count, format, userId) {
        const event = {
            timestamp: new Date().toISOString(),
            type: 'export',
            resourceType,
            count,
            format,
            userId: userId || localStorage.getItem('userId'),
            userRole: localStorage.getItem('userRole'),
            outcome: 'success',
            sessionId: this.getSessionId()
        };

        this.addEvent(event);
        this.sendToBackend(event);
    }

    // Log security event
    logSecurity(eventType, details, outcome = 'success') {
        const event = {
            timestamp: new Date().toISOString(),
            type: 'security',
            eventType, // login, logout, permission_denied, token_refresh
            details,
            userId: localStorage.getItem('userId'),
            userRole: localStorage.getItem('userRole'),
            outcome,
            ipAddress: 'client-side', // Would need backend to get real IP
            sessionId: this.getSessionId()
        };

        this.addEvent(event);
        this.sendToBackend(event);
    }

    // Log consent event
    logConsent(patientId, consentType, action, details) {
        const event = {
            timestamp: new Date().toISOString(),
            type: 'consent',
            patientId,
            consentType,
            action, // granted, revoked, updated
            details,
            userId: localStorage.getItem('userId'),
            userRole: localStorage.getItem('userRole'),
            sessionId: this.getSessionId()
        };

        this.addEvent(event);
        this.sendToBackend(event);
    }

    // Log data validation event
    logValidation(resourceType, resourceId, validationResult) {
        const event = {
            timestamp: new Date().toISOString(),
            type: 'validation',
            resourceType,
            resourceId,
            isValid: validationResult.valid,
            errors: validationResult.errors,
            userId: localStorage.getItem('userId'),
            sessionId: this.getSessionId()
        };

        this.addEvent(event);
    }

    // Add event to local store
    addEvent(event) {
        this.auditEvents.push(event);

        // Keep only the last maxEvents
        if (this.auditEvents.length > this.maxEvents) {
            this.auditEvents = this.auditEvents.slice(-this.maxEvents);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('auditEvents', JSON.stringify(this.auditEvents));
        } catch (e) {
            console.warn('Failed to store audit events in localStorage:', e);
        }
    }

    // Send event to backend
    async sendToBackend(event) {
        try {
            // Queue events to send in batch
            this.eventQueue = this.eventQueue || [];
            this.eventQueue.push(event);

            // Send immediately for critical events
            if (event.type === 'security' || event.type === 'consent') {
                await this.flushQueue();
            } else {
                // Otherwise batch send every 5 seconds
                this.scheduleFlush();
            }
        } catch (error) {
            console.error('Failed to send audit event to backend:', error);
        }
    }

    // Schedule batch send
    scheduleFlush() {
        if (this.flushTimeout) return;

        this.flushTimeout = setTimeout(() => {
            this.flushQueue();
            this.flushTimeout = null;
        }, 5000);
    }

    // Send queued events to backend
    async flushQueue() {
        if (!this.eventQueue || this.eventQueue.length === 0) return;

        const events = [...this.eventQueue];
        this.eventQueue = [];

        try {
            // This would send to your audit endpoint
            // await apiClient.post('/audit/events', { events });
            console.log('Audit events to send:', events);
        } catch (error) {
            // Re-queue events on failure
            this.eventQueue = [...events, ...this.eventQueue];
            throw error;
        }
    }

    // Get or create session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('auditSessionId');
        if (!sessionId) {
            sessionId = this.generateSessionId();
            sessionStorage.setItem('auditSessionId', sessionId);
        }
        return sessionId;
    }

    // Generate unique session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get audit trail for a resource
    getResourceAuditTrail(resourceType, resourceId) {
        return this.auditEvents.filter(event =>
            event.resourceType === resourceType &&
            event.resourceId === resourceId
        );
    }

    // Get user activity
    getUserActivity(userId) {
        return this.auditEvents.filter(event => event.userId === userId);
    }

    // Generate compliance report
    generateComplianceReport(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const relevantEvents = this.auditEvents.filter(event => {
            const eventDate = new Date(event.timestamp);
            return eventDate >= start && eventDate <= end;
        });

        return {
            period: {start: startDate, end: endDate},
            totalEvents: relevantEvents.length,
            byType: this.groupBy(relevantEvents, 'type'),
            byResourceType: this.groupBy(relevantEvents, 'resourceType'),
            byUser: this.groupBy(relevantEvents, 'userId'),
            securityEvents: relevantEvents.filter(e => e.type === 'security'),
            failedAccess: relevantEvents.filter(e => e.outcome !== 'success'),
            dataExports: relevantEvents.filter(e => e.type === 'export')
        };
    }

    // Helper to group events
    groupBy(events, key) {
        return events.reduce((acc, event) => {
            const value = event[key];
            if (!acc[value]) acc[value] = 0;
            acc[value]++;
            return acc;
        }, {});
    }

    // Clear old events
    clearOldEvents(daysToKeep = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        this.auditEvents = this.auditEvents.filter(event =>
            new Date(event.timestamp) > cutoffDate
        );

        localStorage.setItem('auditEvents', JSON.stringify(this.auditEvents));
    }

    // Export audit log
    exportAuditLog(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.auditEvents, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(this.auditEvents);
        }
    }

    // Convert to CSV
    convertToCSV(events) {
        if (events.length === 0) return '';

        const headers = Object.keys(events[0]);
        const csv = [
            headers.join(','),
            ...events.map(event =>
                headers.map(header =>
                    JSON.stringify(event[header] || '')
                ).join(',')
            )
        ].join('\n');

        return csv;
    }
}

// Create singleton instance
const auditLogger = new AuditLogger();

// Restore events from localStorage
try {
    const storedEvents = localStorage.getItem('auditEvents');
    if (storedEvents) {
        auditLogger.auditEvents = JSON.parse(storedEvents);
    }
} catch (e) {
    console.warn('Failed to restore audit events from localStorage:', e);
}

export default auditLogger;

// Convenience functions for common logging
export const logResourceAccess = (resourceType, resourceId, action) => {
    auditLogger.logAccess(resourceType, resourceId, action);
};

export const logSecurityEvent = (eventType, details, outcome) => {
    auditLogger.logSecurity(eventType, details, outcome);
};

export const logDataExport = (resourceType, count, format) => {
    auditLogger.logExport(resourceType, count, format);
};