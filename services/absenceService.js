const { promisify } = require('util');

class AbsenceService {
  constructor(database) {
    this.db = database;
    // Convert callback-based methods to promise-based
    this.getAllAbsences = promisify(this.db.getAllAbsences.bind(this.db));
    this.addAbsence = promisify(this.db.addAbsence.bind(this.db));
    this.deleteAbsence = promisify(this.db.deleteAbsence.bind(this.db));
    this.getAbsencesForDateRange = promisify(this.db.getAbsencesForDateRange.bind(this.db));
  }

  async createAbsence(memberId, startDate, endDate) {
    try {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }

      const absence = await this.addAbsence(memberId, startDate, endDate);
      return absence;
    } catch (error) {
      throw new Error(`Failed to create absence: ${error.message}`);
    }
  }

  async getAbsences() {
    try {
      const absences = await this.getAllAbsences();
      return absences;
    } catch (error) {
      throw new Error(`Failed to fetch absences: ${error.message}`);
    }
  }

  async removeAbsence(id) {
    try {
      await this.deleteAbsence(id);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete absence: ${error.message}`);
    }
  }

  async getAbsencesForWeek(startDate, endDate) {
    try {
      const absences = await this.getAbsencesForDateRange(startDate, endDate);
      return absences;
    } catch (error) {
      throw new Error(`Failed to fetch absences for date range: ${error.message}`);
    }
  }

  // Check if a member is absent on a specific date
  async isMemberAbsent(memberId, date) {
    try {
      const absences = await this.getAbsencesForDateRange(date, date);
      return absences.some(absence => absence.member_id === memberId);
    } catch (error) {
      throw new Error(`Failed to check member absence: ${error.message}`);
    }
  }

  // Get all absent members for a specific date
  async getAbsentMembersForDate(date) {
    try {
      const absences = await this.getAbsencesForDateRange(date, date);
      return absences.map(absence => ({
        id: absence.member_id,
        first_name: absence.first_name,
        last_name: absence.last_name,
        member_name: absence.member_name
      }));
    } catch (error) {
      throw new Error(`Failed to get absent members for date: ${error.message}`);
    }
  }
}

module.exports = AbsenceService;