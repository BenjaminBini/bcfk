import { writable, derived, get } from 'svelte/store';
import { api } from '../lib/api.js';

// Store for all members
export const members = writable([]);

// Store for all assignments
export const assignments = writable([]);

// Loading states
export const isLoading = writable(false);
export const error = writable(null);

// Configuration
export const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
export const slotTypes = ['ouverture', 'fermeture'];

// Derived store for assignments grouped by day and slot
export const assignmentsBySlot = derived(assignments, ($assignments) => {
  const grouped = {};
  
  dayNames.forEach((day, dayIndex) => {
    grouped[dayIndex] = {};
    slotTypes.forEach(slotType => {
      grouped[dayIndex][slotType] = $assignments.filter(
        a => a.weekday === dayIndex && a.slot_type === slotType
      );
    });
  });
  
  return grouped;
});

// Actions
export const assignmentActions = {
  // Load initial data
  async loadData() {
    isLoading.set(true);
    error.set(null);
    
    try {
      const data = await api.getAssignmentData();
      members.set(data.members || []);
      assignments.set(data.assignments || []);
    } catch (err) {
      console.error('Failed to load assignment data:', err);
      error.set('Failed to load assignment data');
    } finally {
      isLoading.set(false);
    }
  },

  // Add member to slot
  async addMemberToSlot(weekday, slotType, memberId) {
    isLoading.set(true);
    error.set(null);
    
    try {
      // Get current assignments and members using get() to avoid orphaned effects
      const currentAssignments = get(assignments);
      const currentMembers = get(members);
      
      const currentSlotAssignments = currentAssignments.filter(
        a => a.weekday === weekday && a.slot_type === slotType
      );
      
      const currentMemberIds = currentSlotAssignments.map(a => a.member_id);
      const newMemberIds = [...currentMemberIds, memberId];
      
      // Update via API
      const result = await api.updateAssignments(weekday, slotType, newMemberIds);
      
      if (result.success) {
        // Remove old assignments for this slot
        const updatedAssignments = currentAssignments.filter(
          a => !(a.weekday === weekday && a.slot_type === slotType)
        );
        
        // Add new assignments
        newMemberIds.forEach(id => {
          const member = currentMembers.find(m => m.id === id);
          if (member) {
            updatedAssignments.push({
              weekday,
              slot_type: slotType,
              member_id: id,
              member_name: member.first_name,
              display_name: member.display_name || member.first_name
            });
          }
        });
        
        assignments.set(updatedAssignments);
        return { success: true, warnings: result.warnings };
      } else {
        throw new Error('Failed to update assignments');
      }
    } catch (err) {
      console.error('Failed to add member to slot:', err);
      error.set('Failed to add member to slot');
      throw err;
    } finally {
      isLoading.set(false);
    }
  },

  // Remove member from slot
  async removeMemberFromSlot(weekday, slotType, memberId) {
    isLoading.set(true);
    error.set(null);
    
    try {
      // Get current assignments and members using get() to avoid orphaned effects
      const currentAssignments = get(assignments);
      const currentMembers = get(members);
      
      const currentSlotAssignments = currentAssignments.filter(
        a => a.weekday === weekday && a.slot_type === slotType
      );
      
      const newMemberIds = currentSlotAssignments
        .map(a => a.member_id)
        .filter(id => id !== memberId);
      
      // Update via API
      const result = await api.updateAssignments(weekday, slotType, newMemberIds);
      
      if (result.success) {
        // Remove old assignments for this slot
        const updatedAssignments = currentAssignments.filter(
          a => !(a.weekday === weekday && a.slot_type === slotType)
        );
        
        // Add new assignments
        newMemberIds.forEach(id => {
          const member = currentMembers.find(m => m.id === id);
          if (member) {
            updatedAssignments.push({
              weekday,
              slot_type: slotType,
              member_id: id,
              member_name: member.first_name,
              display_name: member.display_name || member.first_name
            });
          }
        });
        
        assignments.set(updatedAssignments);
        return { success: true, warnings: result.warnings };
      } else {
        throw new Error('Failed to update assignments');
      }
    } catch (err) {
      console.error('Failed to remove member from slot:', err);
      error.set('Failed to remove member from slot');
      throw err;
    } finally {
      isLoading.set(false);
    }
  }
};