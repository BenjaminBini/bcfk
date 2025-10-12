/**
 * Service for pure utility functions related to schedule operations
 * These functions don't modify state and can be used statically
 */

export async function fetchWeekData(startDate, endDate) {
    try {
      const response = await fetch(
        `/api/weekly-schedule?start=${startDate}&end=${endDate}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch schedule data: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (err) {
      throw err;
    }
  }