/**
 * Weekly Absences Store
 * 
 * Manages weekly absence data with reactive updates
 */

import { writable, derived } from "svelte";
import { absenceActions } from "./absences.js";

// Core store for weekly absences
export const weeklyAbsences = writable([]);

/**
 * Load absences for a specific week range
 */
export async function loadWeeklyAbsences(weekNavigationLogic) {
  const weekDates = weekNavigationLogic.getCurrentWeekDates();
  const startDate = `${weekDates[0].getFullYear()}-${String(weekDates[0].getMonth() + 1).padStart(2, '0')}-${String(weekDates[0].getDate()).padStart(2, '0')}`;
  const endDate = `${weekDates[6].getFullYear()}-${String(weekDates[6].getMonth() + 1).padStart(2, '0')}-${String(weekDates[6].getDate()).padStart(2, '0')}`;

  try {
    const absences = await absenceActions.getAbsencesForDateRange(startDate, endDate);
    weeklyAbsences.set(absences);
    return absences;
  } catch (error) {
    console.error("Error loading weekly absences:", error);
    weeklyAbsences.set([]);
    return [];
  }
}

/**
 * Get absent members for a specific date
 */
export function getAbsentMembersForDate(dateIndex, weekNavigationLogic) {
  const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
  const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  let currentAbsences;
  weeklyAbsences.subscribe(value => currentAbsences = value)();
  
  return currentAbsences.filter((absence) => {
    return absence.start_date <= date && absence.end_date >= date;
  });
}

/**
 * Get absent members with slot information for a specific date
 */
export async function getAbsentMembersForDateWithSlots(dateIndex, weekNavigationLogic) {
  const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
  const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  
  try {
    const absentMembers = await absenceActions.getAbsentMembersForDate(date);
    return absentMembers;
  } catch (error) {
    console.error("Error getting absent members with slots:", error);
    return [];
  }
}

/**
 * Derived store for easier consumption in components
 */
export const weeklyAbsencesCount = derived(
  weeklyAbsences,
  $weeklyAbsences => $weeklyAbsences.length
);

/**
 * Clear weekly absences (useful for cleanup)
 */
export function clearWeeklyAbsences() {
  weeklyAbsences.set([]);
}