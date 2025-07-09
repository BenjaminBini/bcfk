import { writable } from 'svelte/store';

// Main absences store
export const absences = writable([]);
export const isLoading = writable(false);
export const error = writable(null);

// Actions for absence management
export const absenceActions = {
  async loadAbsences() {
    isLoading.set(true);
    error.set(null);
    
    try {
      const response = await fetch('/api/absences');
      if (!response.ok) {
        throw new Error(`Failed to load absences: ${response.status}`);
      }
      
      const data = await response.json();
      absences.set(data);
    } catch (err) {
      console.error('Error loading absences:', err);
      error.set(err.message);
    } finally {
      isLoading.set(false);
    }
  },

  async createAbsence(memberId, startDate, endDate) {
    try {
      const response = await fetch('/api/absences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: memberId,
          start_date: startDate,
          end_date: endDate
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create absence: ${errorText}`);
      }

      const newAbsence = await response.json();
      
      // Add member info to the absence
      const membersResponse = await fetch('/api/members');
      if (membersResponse.ok) {
        const members = await membersResponse.json();
        const member = members.find(m => m.id === memberId);
        if (member) {
          newAbsence.first_name = member.first_name;
          newAbsence.last_name = member.last_name;
          newAbsence.member_name = member.first_name + (member.last_name ? ' ' + member.last_name : '');
        }
      }
      
      // Update the store
      absences.update(current => [newAbsence, ...current]);
      
      return newAbsence;
    } catch (err) {
      console.error('Error creating absence:', err);
      error.set(err.message);
      throw err;
    }
  },

  async deleteAbsence(absenceId) {
    try {
      const response = await fetch(`/api/absences/${absenceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete absence: ${errorText}`);
      }

      // Remove from store
      absences.update(current => current.filter(absence => absence.id !== absenceId));
    } catch (err) {
      console.error('Error deleting absence:', err);
      error.set(err.message);
      throw err;
    }
  },

  async getAbsencesForDateRange(startDate, endDate) {
    try {
      const response = await fetch(`/api/absences/date-range?start=${startDate}&end=${endDate}`);
      if (!response.ok) {
        throw new Error(`Failed to load absences for date range: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error loading absences for date range:', err);
      error.set(err.message);
      return [];
    }
  },

  async getAbsentMembersForDate(date) {
    try {
      const response = await fetch(`/api/absences/date/${date}`);
      if (!response.ok) {
        throw new Error(`Failed to load absent members for date: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error loading absent members for date:', err);
      error.set(err.message);
      return [];
    }
  }
};