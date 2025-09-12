/**
 * Centralized constants for consistent day names and other configuration across the application
 */

// French day names for UI display (Monday = 0, Sunday = 6)
export const WEEK_DAYS = [
  "Lundi",
  "Mardi", 
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche"
];

// English day names for API/backend usage
export const WEEK_DAYS_EN = [
  "Monday",
  "Tuesday",
  "Wednesday", 
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

// Short day names for compact displays
export const WEEK_DAYS_SHORT = [
  "Lun",
  "Mar",
  "Mer", 
  "Jeu",
  "Ven",
  "Sam",
  "Dim"
];

// Day name mappings for different contexts
export const DAY_NAMES = {
  full: WEEK_DAYS,
  short: WEEK_DAYS_SHORT,
  english: WEEK_DAYS_EN
};

// Utility function to get day name by index and format
export function getDayName(dayIndex, format = 'full') {
  const days = DAY_NAMES[format] || DAY_NAMES.full;
  return days[dayIndex] || '';
}

// Utility function to get all day names in specified format
export function getAllDayNames(format = 'full') {
  return DAY_NAMES[format] || DAY_NAMES.full;
}