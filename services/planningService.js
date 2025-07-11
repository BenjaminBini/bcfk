const config = require('../config');

class PlanningService {
  constructor(database, memberService) {
    this.db = database;
    this.memberService = memberService;
  }

  getCurrentWeekDates() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      dates.push(dateStr);
    }
    
    return dates;
  }

  async getSpecificAssignments(startDate, endDate) {
    return new Promise((resolve, reject) => {
      this.db.getSpecificAssignments(startDate, endDate, (err, assignments) => {
        if (err) reject(err);
        else resolve(assignments);
      });
    });
  }


  async generateRecurringSlots(startDate) {
    return new Promise((resolve, reject) => {
      this.db.generateRecurringSlots(startDate, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getWeeklyPlanningData() {
    try {
      const weekDates = this.getCurrentWeekDates();
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      
      const members = await this.memberService.getMembersWithDisplayNames();
      
      // Only regenerate slots from recurring assignments if no generated ones exist
      const existingAssignments = await this.getSpecificAssignments(startDate, endDate);
      const generatedAssignments = existingAssignments.filter(a => a.source === 'generated');
      
      if (generatedAssignments.length === 0) {
        await this.generateRecurringSlots(startDate);
      }
      
      // Get all assignments (both generated from recurring and manual specific ones)
      const assignments = await this.getSpecificAssignments(startDate, endDate);
      const assignmentsWithDisplayNames = this.memberService.applyDisplayNamesToData(assignments, members);
      
      return {
        weekDates,
        slots: assignmentsWithDisplayNames,
        dayNames: config.ui.dayNames
      };
    } catch (error) {
      throw new Error(`Failed to get weekly planning data: ${error.message}`);
    }
  }


  async createSpecificAssignment(memberId, date, slotType) {
    return new Promise((resolve, reject) => {
      this.db.createSpecificAssignment(memberId, date, slotType, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async deleteSpecificAssignment(assignmentId) {
    return new Promise((resolve, reject) => {
      this.db.deleteSpecificAssignment(assignmentId, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = PlanningService;