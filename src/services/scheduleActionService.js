import { absenceService } from '../lib/absenceService.js';

/**
 * Service for schedule actions that modify context state
 * All functions take context as parameter to maintain clean separation
 */
export class ScheduleActionService {
  /**
   * Handle absence creation
   * @param {Object} context - The unified schedule context
   * @param {Object} data - Absence data {memberId, date, slot, isFullDay}
   * @param {Function} onComplete - Callback when complete
   */
  static async handleAbsenceCreate(context, data, onComplete) {
    const { memberId, date, slot, isFullDay } = data;

    try {
      // Determine slot type for API
      let startSlot = slot;
      let endSlot = slot;

      if (isFullDay) {
        startSlot = 'ouverture';
        endSlot = 'fermeture';
      }

      // Create absence via API
      await absenceService.createAbsence(memberId, date, date, startSlot, endSlot);

      // Refresh data
      await context.refreshCurrentWeek();

      // Call completion callback
      onComplete?.();
    } catch (error) {
      console.error('Failed to create absence:', error);
      throw error;
    }
  }

  /**
   * Handle presence creation
   * @param {Object} context - The unified schedule context
   * @param {Object} data - Presence data {memberId, date, slot}
   * @param {Function} onComplete - Callback when complete
   */
  static async handlePresenceCreate(context, data, onComplete) {
    const { memberId, date, slot } = data;

    try {
      // Create specific assignment via API
      const response = await fetch('/api/specific-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          date: date,
          slot_type: slot,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create specific assignment');
      }

      // Refresh data
      await context.refreshCurrentWeek();

      // Call completion callback
      onComplete?.();
    } catch (error) {
      console.error('Failed to create presence:', error);
      throw error;
    }
  }

  /**
   * Handle presence deletion
   * @param {Object} context - The unified schedule context
   * @param {Object} data - Deletion data {assignmentId}
   * @param {Function} onComplete - Callback when complete
   */
  static async handlePresenceDelete(context, data, onComplete) {
    const { assignmentId } = data;

    try {
      // Delete specific assignment via API
      const response = await fetch(`/api/specific-assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete specific assignment');
      }

      // Refresh data
      await context.refreshCurrentWeek();

      // Call completion callback
      onComplete?.();
    } catch (error) {
      console.error('Failed to delete presence:', error);
      throw error;
    }
  }
}