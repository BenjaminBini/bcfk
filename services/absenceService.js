const { promisify } = require('util');

class AbsenceService {
  constructor(database) {
    this.db = database;
    // Convert callback-based methods to promise-based
    this.getAllAbsences = promisify(this.db.getAllAbsences.bind(this.db));
    this.addAbsence = promisify(this.db.addAbsence.bind(this.db));
    this.deleteAbsence = promisify(this.db.deleteAbsence.bind(this.db));
    this.getAbsencesForDateRange = promisify(this.db.getAbsencesForDateRange.bind(this.db));
    this.isMemberAbsentForSlot = promisify(this.db.isMemberAbsentForSlot.bind(this.db));
  }

  async createAbsence(memberId, startDate, endDate, startSlot = 'ouverture', endSlot = 'fermeture') {
    try {
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        throw new Error('Start date must be before or equal to end date');
      }

      // Validate slot configuration for same-day absences
      if (startDate === endDate && startSlot === 'fermeture' && endSlot === 'ouverture') {
        throw new Error('Invalid slot configuration: cannot start at closing and end at opening on the same day');
      }

      const absence = await this.addAbsence(memberId, startDate, endDate, startSlot, endSlot);
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

  // Check if a member is absent for a specific slot
  async isMemberAbsentForSpecificSlot(memberId, date, slot) {
    try {
      return await this.isMemberAbsentForSlot(memberId, date, slot);
    } catch (error) {
      throw new Error(`Failed to check member slot absence: ${error.message}`);
    }
  }

  // Get absent members for a specific date with calculated slot information
  async getAbsentMembersForDate(date) {
    try {
      const absences = await this.getAbsencesForDateRange(date, date);
      return absences.map(absence => {
        let absence_slots;
        
        // Determine which slots are covered by this absence
        if (absence.start_date < date && absence.end_date > date) {
          absence_slots = 'both'; // Multi-day absence covers all slots
        } else if (absence.start_date === date && absence.end_date === date) {
          // Same day absence - check slot coverage
          if (absence.start_slot === 'ouverture' && absence.end_slot === 'fermeture') {
            absence_slots = 'both';
          } else if (absence.start_slot === absence.end_slot) {
            absence_slots = absence.start_slot;
          } else {
            absence_slots = 'both'; // Different slots means full day
          }
        } else if (absence.start_date === date) {
          // Starts on this date
          absence_slots = absence.start_slot === 'ouverture' ? 'both' : 'fermeture';
        } else if (absence.end_date === date) {
          // Ends on this date
          absence_slots = absence.end_slot === 'fermeture' ? 'both' : 'ouverture';
        } else {
          absence_slots = 'both';
        }

        return {
          id: absence.member_id,
          member_id: absence.member_id,
          first_name: absence.first_name,
          last_name: absence.last_name,
          member_name: absence.member_name,
          absence_slots,
          start_date: absence.start_date,
          end_date: absence.end_date,
          start_slot: absence.start_slot,
          end_slot: absence.end_slot
        };
      });
    } catch (error) {
      throw new Error(`Failed to get absent members for date: ${error.message}`);
    }
  }
}

module.exports = AbsenceService;