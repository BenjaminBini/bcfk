const config = require('../config');

class AssignmentService {
  constructor(database, memberService) {
    this.db = database;
    this.memberService = memberService;
  }

  async getDefaultAssignments() {
    return new Promise((resolve, reject) => {
      this.db.getDefaultAssignments((err, assignments) => {
        if (err) reject(err);
        else resolve(assignments);
      });
    });
  }

  async setDefaultAssignment(weekday, slotType, memberIds) {
    return new Promise((resolve, reject) => {
      this.db.setDefaultAssignment(weekday, slotType, memberIds, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getAssignmentData() {
    try {
      const members = await this.memberService.getMembersWithDisplayNames();
      const assignments = await this.getDefaultAssignments();
      const assignmentsWithDisplayNames = this.memberService.applyDisplayNamesToData(assignments, members);
      
      return {
        members,
        assignments: assignmentsWithDisplayNames,
        dayNames: config.ui.dayNames,
        slotTypes: config.ui.slotTypes
      };
    } catch (error) {
      throw new Error(`Failed to get assignment data: ${error.message}`);
    }
  }

  validateAssignment(weekday, slotType, memberIds) {
    // Validate weekday (0-6)
    if (weekday < 0 || weekday > 6) {
      throw new Error('Invalid weekday. Must be between 0 and 6.');
    }

    // Validate slot type
    if (!config.ui.slotTypes.includes(slotType)) {
      throw new Error(`Invalid slot type. Must be one of: ${config.ui.slotTypes.join(', ')}`);
    }

    // Validate member IDs
    if (!Array.isArray(memberIds)) {
      throw new Error('Member IDs must be an array.');
    }

    // Allow empty slots for UI flexibility - just return warnings
    const warnings = [];
    
    if (slotType === 'fermeture' && memberIds.length < 2) {
      warnings.push('Fermeture slots work best with at least 2 members.');
    }

    if (slotType === 'ouverture' && memberIds.length < 1) {
      warnings.push('Ouverture slots work best with at least 1 member.');
    }

    return { valid: true, warnings };
  }

  async createAssignment(weekday, slot_type, member_id) {
    return new Promise((resolve, reject) => {
      this.db.createAssignment(weekday, slot_type, member_id, (err, assignment) => {
        if (err) reject(err);
        else resolve(assignment);
      });
    });
  }

  async deleteAssignment(id) {
    return new Promise((resolve, reject) => {
      this.db.deleteAssignment(id, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = AssignmentService;