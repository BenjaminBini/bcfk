class AuditService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Log an action with full context
   * @param {string} actionType - CREATE, UPDATE, DELETE
   * @param {string} entityType - member, recurring_assignment, specific_assignment, absence
   * @param {number} entityId - ID of the affected entity
   * @param {object} oldData - Entity state before action (null for CREATE)
   * @param {object} newData - Entity state after action (null for DELETE)
   * @param {object} userInfo - User context (IP, user agent, etc.)
   * @param {object} rollbackData - Data needed to rollback this action
   */
  async logAction(actionType, entityType, entityId, oldData, newData, userInfo = null, rollbackData = null) {
    return new Promise((resolve, reject) => {
      this.db.logAction(
        actionType,
        entityType,
        entityId,
        oldData,
        newData,
        userInfo,
        rollbackData,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  /**
   * Get audit logs with pagination
   */
  async getAuditLogs(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      this.db.getAuditLogs(limit, offset, (err, logs) => {
        if (err) return reject(err);
        
        // Parse JSON fields
        const parsedLogs = logs.map(log => ({
          ...log,
          old_data: log.old_data ? JSON.parse(log.old_data) : null,
          new_data: log.new_data ? JSON.parse(log.new_data) : null,
          user_info: log.user_info ? JSON.parse(log.user_info) : null,
          rollback_data: log.rollback_data ? JSON.parse(log.rollback_data) : null
        }));
        
        resolve(parsedLogs);
      });
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async getAuditLogsByEntity(entityType, entityId) {
    return new Promise((resolve, reject) => {
      this.db.getAuditLogsByEntity(entityType, entityId, (err, logs) => {
        if (err) return reject(err);
        
        // Parse JSON fields
        const parsedLogs = logs.map(log => ({
          ...log,
          old_data: log.old_data ? JSON.parse(log.old_data) : null,
          new_data: log.new_data ? JSON.parse(log.new_data) : null,
          user_info: log.user_info ? JSON.parse(log.user_info) : null,
          rollback_data: log.rollback_data ? JSON.parse(log.rollback_data) : null
        }));
        
        resolve(parsedLogs);
      });
    });
  }

  /**
   * Helper to extract user info from request (disabled until authentication is implemented)
   */
  extractUserInfo(req) {
    return null; // No user info collected without authentication
  }

  /**
   * Helper to get entity data before modification
   */
  async getEntityData(entityType, entityId) {
    return new Promise((resolve, reject) => {
      switch (entityType) {
        case 'member':
          this.db.db.get('SELECT * FROM members WHERE id = ?', [entityId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
          
        case 'recurring_assignment':
          this.db.db.get(`
            SELECT ra.*, m.first_name, m.last_name 
            FROM recurring_assignments ra 
            JOIN members m ON ra.member_id = m.id 
            WHERE ra.id = ?
          `, [entityId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
          
        case 'specific_assignment':
          this.db.db.get(`
            SELECT sa.*, m.first_name, m.last_name 
            FROM specific_assignments sa 
            JOIN members m ON sa.member_id = m.id 
            WHERE sa.id = ?
          `, [entityId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
          
        case 'absence':
          this.db.db.get(`
            SELECT a.*, m.first_name, m.last_name 
            FROM absences a 
            JOIN members m ON a.member_id = m.id 
            WHERE a.id = ?
          `, [entityId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
          
        default:
          resolve(null);
      }
    });
  }

  /**
   * Generate rollback data for different entity types
   */
  generateRollbackData(actionType, entityType, oldData, newData) {
    const rollback = {
      action_type: actionType,
      entity_type: entityType,
      original_action: actionType
    };

    switch (actionType) {
      case 'CREATE':
        // To rollback a CREATE, we need to DELETE
        rollback.rollback_action = 'DELETE';
        rollback.target_id = newData?.id;
        break;
        
      case 'UPDATE':
        // To rollback an UPDATE, we need to UPDATE back to old values
        rollback.rollback_action = 'UPDATE';
        rollback.target_id = newData?.id || oldData?.id;
        rollback.restore_data = oldData;
        break;
        
      case 'DELETE':
        // To rollback a DELETE, we need to CREATE
        rollback.rollback_action = 'CREATE';
        rollback.restore_data = oldData;
        break;
    }

    return rollback;
  }
}

module.exports = AuditService;