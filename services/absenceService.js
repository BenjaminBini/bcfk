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

      // Get all existing absences for this member
      const allAbsences = await this.getAllAbsences();
      const memberAbsences = allAbsences.filter(a => a.member_id === memberId);

      // Find overlapping or adjacent absences
      const { mergedPeriod, overlappingIds } = this.findOverlapsAndMerge(
        memberAbsences, 
        startDate, 
        endDate, 
        startSlot, 
        endSlot
      );

      // Delete overlapping absences
      for (const absenceId of overlappingIds) {
        await this.deleteAbsence(absenceId);
      }

      // Create the new merged absence
      const absence = await this.addAbsence(
        memberId, 
        mergedPeriod.startDate, 
        mergedPeriod.endDate, 
        mergedPeriod.startSlot, 
        mergedPeriod.endSlot
      );
      
      return absence;
    } catch (error) {
      throw new Error(`Failed to create absence: ${error.message}`);
    }
  }

  // Helper method to find overlaps and merge periods
  findOverlapsAndMerge(existingAbsences, newStartDate, newEndDate, newStartSlot, newEndSlot) {
    const overlappingAbsences = [];
    const slotOrder = { 'ouverture': 1, 'fermeture': 2 };

    // Find all overlapping or adjacent absences
    for (const absence of existingAbsences) {
      if (this.isOverlappingOrAdjacent(absence, newStartDate, newEndDate, newStartSlot, newEndSlot)) {
        overlappingAbsences.push(absence);
      }
    }

    // Start with the new absence period
    let mergedStartDate = newStartDate;
    let mergedEndDate = newEndDate;
    let mergedStartSlot = newStartSlot;
    let mergedEndSlot = newEndSlot;

    // Merge all overlapping periods
    for (const absence of overlappingAbsences) {
      // Determine the earliest start
      if (absence.start_date < mergedStartDate || 
          (absence.start_date === mergedStartDate && slotOrder[absence.start_slot] < slotOrder[mergedStartSlot])) {
        mergedStartDate = absence.start_date;
        mergedStartSlot = absence.start_slot;
      }

      // Determine the latest end
      if (absence.end_date > mergedEndDate || 
          (absence.end_date === mergedEndDate && slotOrder[absence.end_slot] > slotOrder[mergedEndSlot])) {
        mergedEndDate = absence.end_date;
        mergedEndSlot = absence.end_slot;
      }
    }

    return {
      mergedPeriod: {
        startDate: mergedStartDate,
        endDate: mergedEndDate,
        startSlot: mergedStartSlot,
        endSlot: mergedEndSlot
      },
      overlappingIds: overlappingAbsences.map(a => a.id)
    };
  }

  // Helper method to check if two absence periods overlap or are adjacent
  isOverlappingOrAdjacent(existingAbsence, newStartDate, newEndDate, newStartSlot, newEndSlot) {
    const slotOrder = { 'ouverture': 1, 'fermeture': 2 };

    // Convert dates for comparison
    const existingStart = existingAbsence.start_date;
    const existingEnd = existingAbsence.end_date;

    // Case 1: Direct overlap (dates intersect)
    if (!(newEndDate < existingStart || newStartDate > existingEnd)) {
      return true; // Any overlap
    }

    // Case 2: Adjacent periods on the same day
    if (newEndDate === existingStart && newStartDate === newEndDate) {
      // Same day: check if new period ends where existing starts
      const newEndSlotOrder = slotOrder[newEndSlot];
      const existingStartSlotOrder = slotOrder[existingAbsence.start_slot];
      return newEndSlotOrder === existingStartSlotOrder - 1; // Adjacent slots
    }

    if (newStartDate === existingEnd && existingStart === existingEnd) {
      // Same day: check if existing period ends where new starts
      const existingEndSlotOrder = slotOrder[existingAbsence.end_slot];
      const newStartSlotOrder = slotOrder[newStartSlot];
      return existingEndSlotOrder === newStartSlotOrder - 1; // Adjacent slots
    }

    // Case 3: Adjacent periods on consecutive days
    const newStartDateObj = new Date(newStartDate);
    const newEndDateObj = new Date(newEndDate);
    const existingStartObj = new Date(existingStart);
    const existingEndObj = new Date(existingEnd);

    // Check if periods are on consecutive days
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    // New period ends day before existing starts
    if (Math.abs(existingStartObj - newEndDateObj) === oneDayMs) {
      // For consecutive full days, any adjacent days should merge
      if (newEndSlot === 'fermeture' && existingAbsence.start_slot === 'ouverture') {
        return true;
      }
      // Also merge if it's touching the next day
      return newEndSlot === 'fermeture' || existingAbsence.start_slot === 'ouverture';
    }

    // Existing period ends day before new starts  
    if (Math.abs(newStartDateObj - existingEndObj) === oneDayMs) {
      // For consecutive full days, any adjacent days should merge
      if (existingAbsence.end_slot === 'fermeture' && newStartSlot === 'ouverture') {
        return true;
      }
      // Also merge if it's touching the previous day
      return existingAbsence.end_slot === 'fermeture' || newStartSlot === 'ouverture';
    }

    // No adjacency or overlap
    return false;
  }

  // Helper method to merge two absence periods
  mergePeriods(period1, period2) {
    const slotOrder = { 'ouverture': 1, 'fermeture': 2 };
    
    // Determine the earliest start
    let mergedStartDate = period1.start_date;
    let mergedStartSlot = period1.start_slot;
    
    if (period2.start_date < mergedStartDate || 
        (period2.start_date === mergedStartDate && slotOrder[period2.start_slot] < slotOrder[mergedStartSlot])) {
      mergedStartDate = period2.start_date;
      mergedStartSlot = period2.start_slot;
    }

    // Determine the latest end
    let mergedEndDate = period1.end_date;
    let mergedEndSlot = period1.end_slot;
    
    if (period2.end_date > mergedEndDate || 
        (period2.end_date === mergedEndDate && slotOrder[period2.end_slot] > slotOrder[mergedEndSlot])) {
      mergedEndDate = period2.end_date;
      mergedEndSlot = period2.end_slot;
    }

    return {
      start_date: mergedStartDate,
      end_date: mergedEndDate,
      start_slot: mergedStartSlot,
      end_slot: mergedEndSlot
    };
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