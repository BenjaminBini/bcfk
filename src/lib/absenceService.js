/**
 * Absence Service - Frontend API client for absence operations
 */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(`HTTP ${response.status}: ${text}`, response.status, response);
  }
  return await response.json();
}

export const absenceService = {
  /**
   * Get all absences
   */
  async getAbsences() {
    const response = await fetch(`${API_BASE}/absences`);
    return handleResponse(response);
  },

  /**
   * Create a new absence
   */
  async createAbsence(memberId, startDate, endDate, startSlot = 'ouverture', endSlot = 'fermeture') {
    const response = await fetch(`${API_BASE}/absences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        member_id: memberId,
        start_date: startDate,
        end_date: endDate,
        start_slot: startSlot,
        end_slot: endSlot
      })
    });
    return handleResponse(response);
  },

  /**
   * Delete an absence
   */
  async deleteAbsence(absenceId) {
    const response = await fetch(`${API_BASE}/absences/${absenceId}`, {
      method: 'DELETE'
    });
    return handleResponse(response);
  }
};