/**
 * Audit logging middleware for tracking CRUD operations
 */

const auditMiddleware = (auditService) => {
  return (action, entityType) => {
    return async (req, res, next) => {
      // Store original res.json method
      const originalJson = res.json;
      const originalSend = res.send;
      
      // Override res.json to capture successful responses
      res.json = function(data) {
        // Only log successful operations (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logAuditEvent(auditService, action, entityType, req, data, res.statusCode);
        }
        return originalJson.call(this, data);
      };
      
      // Override res.send for non-JSON responses
      res.send = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          logAuditEvent(auditService, action, entityType, req, data, res.statusCode);
        }
        return originalSend.call(this, data);
      };
      
      next();
    };
  };
};

async function logAuditEvent(auditService, action, entityType, req, responseData, statusCode) {
  try {
    if (!auditService) return;
    
    const auditData = {
      action,
      entityType,
      entityId: extractEntityId(req, responseData),
      userId: req.user?.id || null,
      userAgent: req.get('User-Agent') || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString(),
      requestMethod: req.method,
      requestPath: req.path,
      requestBody: sanitizeRequestData(req.body),
      responseStatus: statusCode
    };
    
    await auditService.logAction(
      auditData.action,
      auditData.entityType,
      auditData.entityId,
      null, // oldData - would need to be provided separately for UPDATE/DELETE
      auditData.requestBody, // newData
      {
        userId: auditData.userId,
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent
      }
    );
  } catch (error) {
    // Don't let audit logging errors break the main request
    console.error('Audit logging failed:', error);
  }
}

function extractEntityId(req, responseData) {
  // Try to get ID from various sources
  if (req.params?.id) return req.params.id;
  if (req.body?.id) return req.body.id;
  if (responseData?.id) return responseData.id;
  if (responseData?.member_id) return responseData.member_id;
  if (responseData?.assignment_id) return responseData.assignment_id;
  return null;
}

function sanitizeRequestData(data) {
  if (!data) return null;
  
  // Remove sensitive fields
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  
  return sanitized;
}

// Pre-configured middleware for common operations
auditMiddleware.create = (auditService) => ({
  // Member operations
  createMember: auditMiddleware(auditService)('CREATE', 'member'),
  updateMember: auditMiddleware(auditService)('UPDATE', 'member'),
  deleteMember: auditMiddleware(auditService)('DELETE', 'member'),
  
  // Assignment operations
  createAssignment: auditMiddleware(auditService)('CREATE', 'assignment'),
  updateAssignment: auditMiddleware(auditService)('UPDATE', 'assignment'),
  updateAssignments: auditMiddleware(auditService)('UPDATE', 'assignment'),
  deleteAssignment: auditMiddleware(auditService)('DELETE', 'assignment'),
  
  // Absence operations
  createAbsence: auditMiddleware(auditService)('CREATE', 'absence'),
  updateAbsence: auditMiddleware(auditService)('UPDATE', 'absence'),
  deleteAbsence: auditMiddleware(auditService)('DELETE', 'absence'),
  
  // Generic operations
  read: auditMiddleware(auditService)('READ', 'data'),
  custom: (action, entityType) => auditMiddleware(auditService)(action, entityType)
});

module.exports = auditMiddleware;