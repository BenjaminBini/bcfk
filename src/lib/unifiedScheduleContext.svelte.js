/**
 * Unified Schedule Context - Modern Svelte 5 approach
 *
 * Simple and reliable week-based schedule management with prefetching.
 */

export function createUnifiedScheduleContext() {
  // Core state
  let weekData = $state(null);
  let isLoading = $state(false);
  let isNavigationDisabled = $state(false);
  let error = $state(null);

  // Current week tracking
  let currentWeekStartDate = $state(null);
  let currentWeekOffset = $state(0); // Track offset from original current week for animations

  // Simple cache for previous and next week
  let previousWeekCache = $state(null);
  let nextWeekCache = $state(null);

  // Member state tracking for animations
  let previousMemberStates = $state(new Map());
  let memberTransitions = $state(new Map());

  // Calculate current week start date (Monday)
  function getCurrentWeekStartDate() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  }

  // Format date for API calls
  function formatDate(date) {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  }

  // Get week date range (Monday to Sunday)
  function getWeekDateRange(startDate) {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(start.getDate() + 6);

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      dates: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        return formatDate(date);
      }),
    };
  }

  /**
   * Fetch schedule data for a specific week date range using the new API
   */
  async function fetchWeekData(startDate, endDate) {
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

  /**
   * Get data for a specific date
   */
  function getDataForDate(dateString) {
    if (!weekData?.schedule) return null;
    return weekData.schedule.find((day) => day.date === dateString) || null;
  }

  /**
   * Extract member states from schedule data for animation tracking
   */
  function extractMemberStates(scheduleData) {
    const states = new Map();

    if (!scheduleData?.schedule) return states;

    scheduleData.schedule.forEach((day, dayIndex) => {
      ["ouverture", "fermeture"].forEach((slotType) => {
        const slot = day[slotType];
        if (!slot) return;

        // Track present assigned members
        slot.presentAssignedMembers?.forEach((member) => {
          const key = `${member.memberId}-${dayIndex}-${slotType}`;
          states.set(key, "present");
        });

        // Track absent assigned members
        slot.absentAssignedMembers?.forEach((member) => {
          const key = `${member.memberId}-${dayIndex}-${slotType}`;
          states.set(key, "absent");
        });

        // Track occasional present members
        slot.occasionalPresentMembers?.forEach((member) => {
          const key = `${member.memberId}-${dayIndex}-${slotType}`;
          states.set(key, "occasional");
        });
      });
    });

    return states;
  }

  /**
   * Detect member state transitions for animations
   */
  function detectMemberTransitions(newStates) {
    const transitions = new Map();

    // Check for state changes
    for (const [key, newState] of newStates) {
      const oldState = previousMemberStates.get(key);
      if (oldState && oldState !== newState) {
        transitions.set(key, {
          from: oldState,
          to: newState,
          timestamp: Date.now(),
        });
      }
    }

    // Also check for members who disappeared (present -> not present)
    for (const [key, oldState] of previousMemberStates) {
      if (!newStates.has(key) && oldState === "present") {
        transitions.set(key, {
          from: "present",
          to: "disappeared",
          timestamp: Date.now(),
        });
      }
    }

    return transitions;
  }

  /**
   * Check if a member has a transition animation pending
   */
  function getMemberTransition(memberId, dayIndex, slotType) {
    const key = `${memberId}-${dayIndex}-${slotType}`;
    return memberTransitions.get(key);
  }

  /**
   * Update member states and detect transitions
   */
  function updateMemberStates(newScheduleData) {
    const newStates = extractMemberStates(newScheduleData);
    const transitions = detectMemberTransitions(newStates);

    // Update states and transitions
    previousMemberStates = newStates;
    memberTransitions = transitions;

    // Clear old transitions after animation duration
    setTimeout(() => {
      memberTransitions = new Map();
    }, 1500);
  }

  /**
   * Get the current week's dates (7 days)
   */
  const currentWeekDates = $derived(() => {
    if (!weekData?.dates) return [];
    return weekData.dates;
  });

  /**
   * Get current week schedule data (7 days)
   */
  const currentWeekSchedule = $derived(() => {
    if (!weekData?.schedule) return [];
    return weekData.schedule;
  });

  /**
   * Navigate to previous week
   */
  async function goToPreviousWeek() {
    if (isNavigationDisabled || !previousWeekCache) {
      console.warn("Navigation disabled or no previous week cached");
      return;
    }

    isNavigationDisabled = true;

    try {
      // Move to previous week using cached data
      const previousWeekStart = new Date(currentWeekStartDate);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);

      currentWeekStartDate = previousWeekStart;
      currentWeekOffset = currentWeekOffset - 1; // Decrement offset for previous week

      // Update member states and detect transitions before setting new data
      updateMemberStates(previousWeekCache);
      weekData = previousWeekCache;

      // Clear both caches
      previousWeekCache = null;
      nextWeekCache = null;

      // Prefetch new previous and next weeks
      await prefetchAdjacentWeeks();
    } finally {
      isNavigationDisabled = false;
    }
  }

  /**
   * Navigate to next week
   */
  async function goToNextWeek() {
    if (isNavigationDisabled || !nextWeekCache) {
      console.warn("Navigation disabled or no next week cached");
      return;
    }

    isNavigationDisabled = true;

    try {
      // Move to next week using cached data
      const nextWeekStart = new Date(currentWeekStartDate);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      currentWeekStartDate = nextWeekStart;
      currentWeekOffset = currentWeekOffset + 1; // Increment offset for next week

      // Update member states and detect transitions before setting new data
      updateMemberStates(nextWeekCache);
      weekData = nextWeekCache;

      // Clear both caches
      previousWeekCache = null;
      nextWeekCache = null;

      // Prefetch new previous and next weeks
      await prefetchAdjacentWeeks();
    } finally {
      isNavigationDisabled = false;
    }
  }

  /**
   * Prefetch previous and next weeks for instant navigation
   */
  async function prefetchAdjacentWeeks() {
    try {
      const currentStart = new Date(currentWeekStartDate);

      // Calculate previous and next week ranges
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      const previousRange = getWeekDateRange(previousStart);

      const nextStart = new Date(currentStart);
      nextStart.setDate(nextStart.getDate() + 7);
      const nextRange = getWeekDateRange(nextStart);

      // Fetch both weeks concurrently
      const [previousData, nextData] = await Promise.all([
        fetchWeekData(previousRange.startDate, previousRange.endDate),
        fetchWeekData(nextRange.startDate, nextRange.endDate),
      ]);

      // Update cache
      previousWeekCache = { ...previousData, dates: previousRange.dates };
      nextWeekCache = { ...nextData, dates: nextRange.dates };
    } catch (err) {
      console.warn("Failed to prefetch adjacent weeks:", err.message);
      // Don't throw - this is background operation
    }
  }

  /**
   * Initial data load - load current week and prefetch adjacent weeks
   */
  async function loadInitialData() {
    isLoading = true;
    error = null;

    try {
      console.log("Loading initial data...");

      // Set current week start date
      currentWeekStartDate = getCurrentWeekStartDate();
      const currentRange = getWeekDateRange(currentWeekStartDate);

      // Fetch current week data
      const fetchedData = await fetchWeekData(
        currentRange.startDate,
        currentRange.endDate
      );
      const newWeekData = { ...fetchedData, dates: currentRange.dates };

      // Initialize member states on first load
      previousMemberStates = extractMemberStates(newWeekData);
      weekData = newWeekData;

      // Prefetch adjacent weeks for navigation
      await prefetchAdjacentWeeks();

      console.log("Initial data loaded successfully");
    } catch (err) {
      console.error("Error during initial data load:", err);
      error = err.message;
      throw err;
    } finally {
      isLoading = false;
    }
  }

  /**
   * Optimistic update - add a member to a specific slot
   */
  function addMemberOptimistically(dateString, slotType, memberData) {
    const dayData = getDataForDate(dateString);
    if (!dayData) return;

    const slotData = dayData[slotType];
    if (!slotData) return;

    // Add to occasional present members
    slotData.occasionalPresentMembers = [
      ...slotData.occasionalPresentMembers,
      {
        id: `temp_${Date.now()}`, // Temporary ID
        memberId: memberData.memberId,
        first_name: memberData.first_name,
        last_name: memberData.last_name || "",
        isOptimistic: true, // Flag to indicate this is pending server confirmation
      },
    ];
  }

  /**
   * Optimistic update - remove a member from a specific slot
   */
  function removeMemberOptimistically(dateString, slotType, assignmentId) {
    const dayData = getDataForDate(dateString);
    if (!dayData) return;

    const slotData = dayData[slotType];
    if (!slotData) return;

    // Remove from occasional present members
    slotData.occasionalPresentMembers =
      slotData.occasionalPresentMembers.filter(
        (member) => member.id !== assignmentId
      );
  }

  /**
   * Optimistic update - mark a member as absent
   */
  function markMemberAbsentOptimistically(
    dateString,
    memberId,
    memberData,
    absenceData
  ) {
    const dayData = getDataForDate(dateString);
    if (!dayData) return;

    // Move from present to absent in both slots if needed
    ["ouverture", "fermeture"].forEach((slotType) => {
      const slotData = dayData[slotType];

      // Find member in present assigned and move to absent assigned
      const memberIndex = slotData.presentAssignedMembers.findIndex(
        (m) => m.memberId === memberId
      );

      if (memberIndex !== -1) {
        const member = slotData.presentAssignedMembers[memberIndex];
        slotData.presentAssignedMembers.splice(memberIndex, 1);

        slotData.absentAssignedMembers.push({
          ...member,
          absenceDetails: absenceData,
          isOptimistic: true,
        });
      }
    });

    // Add to allAbsentMembers
    const absentMember = {
      id: `temp_${Date.now()}`,
      memberId,
      first_name: memberData.first_name,
      last_name: memberData.last_name || "",
      absenceDetails: absenceData,
      isOptimistic: true,
    };

    if (absenceData.slotType === "both" || !absenceData.slotType) {
      dayData.allAbsentMembers.fullDay.push(absentMember);
    } else if (absenceData.slotType === "ouverture") {
      dayData.allAbsentMembers.ouvertureOnly.push(absentMember);
    } else if (absenceData.slotType === "fermeture") {
      dayData.allAbsentMembers.fermetureOnly.push(absentMember);
    }
  }

  /**
   * Refresh data after server-side changes
   */
  async function refreshCurrentWeek() {
    if (!currentWeekStartDate) return;

    const range = getWeekDateRange(currentWeekStartDate);
    const fetchedData = await fetchWeekData(range.startDate, range.endDate);
    weekData = { ...fetchedData, dates: range.dates };

    // Also refresh adjacent week caches
    previousWeekCache = null;
    nextWeekCache = null;
    await prefetchAdjacentWeeks();
  }

  return {
    // State
    get scheduleData() {
      return weekData;
    }, // Backward compatibility
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get isNavigationDisabled() {
      return isNavigationDisabled;
    },

    // Week tracking
    get currentWeekStartDate() {
      return currentWeekStartDate;
    },
    get currentWeekOffset() {
      return currentWeekOffset;
    },

    // Computed data (returned as getters to maintain reactivity)
    get currentWeekDates() {
      return currentWeekDates;
    },
    get currentWeekData() {
      return currentWeekSchedule;
    }, // Backward compatibility

    // Actions
    loadInitialData,
    getDataForDate,
    goToPreviousWeek,
    goToNextWeek,

    // Animation support
    getMemberTransition,

    // Optimistic updates
    addMemberOptimistically,
    removeMemberOptimistically,
    markMemberAbsentOptimistically,

    // Data management
    refreshCurrentWeek,
  };
}
