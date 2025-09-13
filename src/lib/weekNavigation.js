export function createWeekNavigation() {
  let currentWeekOffset = $state(0);
  let navigationDirection = $state('next');
  let isNavigating = $state(false);
  let onWeekChange = null;

  function getCurrentWeek() {
    const now = new Date();
    now.setDate(now.getDate() + (currentWeekOffset * 7));
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + (currentWeekOffset * 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }

  function isCurrentDay(dayIndex) {
    const weekDates = getCurrentWeekDates();
    const today = new Date();
    return weekDates[dayIndex].toDateString() === today.toDateString();
  }

  async function goToPreviousWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = 'previous';
    
    currentWeekOffset--;
    if (onWeekChange) {
      await onWeekChange();
    }
    
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  async function goToNextWeek() {
    if (isNavigating) return;
    isNavigating = true;
    navigationDirection = 'next';
    
    currentWeekOffset++;
    if (onWeekChange) {
      await onWeekChange();
    }
    
    setTimeout(() => {
      isNavigating = false;
    }, 300);
  }

  return {
    get currentWeekOffset() { return currentWeekOffset; },
    set currentWeekOffset(value) { currentWeekOffset = value; },
    get navigationDirection() { return navigationDirection; },
    set navigationDirection(value) { navigationDirection = value; },
    get isNavigating() { return isNavigating; },
    set isNavigating(value) { isNavigating = value; },
    setOnWeekChange: (callback) => { onWeekChange = callback; },
    getCurrentWeek,
    getCurrentWeekDates,
    isCurrentDay,
    goToPreviousWeek,
    goToNextWeek
  };
}