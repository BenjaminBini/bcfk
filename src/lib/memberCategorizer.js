/**
 * Utility functions for categorizing and filtering members based on availability status
 */

/**
 * Filter members based on search text
 * @param {Array} memberList - List of members to filter
 * @param {string} filterText - Search text
 * @returns {Array} Filtered members
 */
export function filterMembers(memberList, filterText) {
  if (!filterText) return memberList;

  const searchTerm = filterText.toLowerCase();
  return memberList.filter((member) => {
    const firstName = (member.first_name || "").toLowerCase();
    const name = (member.name || "").toLowerCase();
    return firstName.includes(searchTerm) || name.includes(searchTerm);
  });
}

/**
 * Categorize members by availability status and filter by search text
 * @param {Object} params - Parameters object
 * @param {Array} params.members - All members
 * @param {Array} params.assignments - Current assignments
 * @param {number} params.selectedDay - Selected day index
 * @param {string} params.selectedSlot - Selected slot type
 * @param {string} params.selectedDate - Selected date in YYYY-MM-DD format
 * @param {Array} params.absentMembers - Members marked as absent
 * @param {Array} params.specificAssignments - Specific date assignments
 * @param {string} params.filterText - Search filter text
 * @returns {Array} Categorized and filtered members with status
 */
export function getCategorizedMembers({
  members = [],
  assignments = [],
  selectedDay = null,
  selectedSlot = null,
  selectedDate = "",
  absentMembers = [],
  specificAssignments = [],
  filterText = "",
}) {
  // Get current assignments for the selected day/slot
  const currentAssignments = assignments.filter(
    (a) => a.weekday === selectedDay && a.slot_type === selectedSlot
  );

  // For specific assignments, we need to filter by the exact date and slot type
  // specificAssignments from unifiedScheduleContext are already filtered for the current date/slot
  const currentSpecificAssignments = specificAssignments() || [];
  const assignedMemberIds = new Set([
    ...currentAssignments.map((a) => a.member_id),
    ...(Array.isArray(currentSpecificAssignments)
      ? currentSpecificAssignments.map((a) => a.memberId || a.member_id)
      : []),
  ]);
  const absentMemberIds = new Set(absentMembers.map((m) => m.member_id));

  // Categorize members
  const availableMembers = members.filter(
    (m) => !assignedMemberIds.has(m.id) && !absentMemberIds.has(m.id)
  );
  const assignedMembersData = members.filter((m) =>
    assignedMemberIds.has(m.id)
  );
  const absentMembersData = members.filter((m) => absentMemberIds.has(m.id));

  // Filter each category
  const filteredAvailable = filterMembers(availableMembers, filterText);
  const filteredAssigned = filterMembers(assignedMembersData, filterText);
  const filteredAbsent = filterMembers(absentMembersData, filterText);

  // Combine with status and prioritize
  const memberMap = new Map();

  // Add available members first (lowest priority)
  filteredAvailable.forEach((member) => {
    memberMap.set(member.id, { ...member, status: "available" });
  });

  // Add assigned members (medium priority)
  filteredAssigned.forEach((member) => {
    memberMap.set(member.id, { ...member, status: "assigned" });
  });

  // Add absent members last (highest priority - overrides all others)
  filteredAbsent.forEach((member) => {
    memberMap.set(member.id, { ...member, status: "absent" });
  });

  // Sort alphabetically by first name
  return Array.from(memberMap.values()).sort((a, b) => {
    const nameA = (a.first_name || "").toLowerCase();
    const nameB = (b.first_name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
}
