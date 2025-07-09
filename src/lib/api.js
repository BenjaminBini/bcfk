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
    const errorText = await response.text();
    throw new ApiError(`HTTP ${response.status}: ${errorText}`, response.status, response);
  }
  
  const data = await response.json();
  return data;
}

export const api = {
  // Get all members
  async getMembers() {
    const response = await fetch(`${API_BASE}/members`);
    return handleResponse(response);
  },

  // Get assignment data (members and assignments)
  async getAssignmentData() {
    const response = await fetch(`${API_BASE}/assignment-data`);
    return handleResponse(response);
  },

  // Update assignments for a specific slot
  async updateAssignments(weekday, slotType, memberIds) {
    const response = await fetch(`${API_BASE}/assignments/${weekday}/${slotType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ memberIds }),
    });
    return handleResponse(response);
  },

  // Add a new member
  async addMember(memberData) {
    const response = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    });
    return handleResponse(response);
  },
};