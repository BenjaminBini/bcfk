<script>
  import SlotWarning from "../assignments/SlotWarning.svelte";
  import SlotAssignmentsList from "../assignments/SlotAssignmentsList.svelte";

  /**
   * @typedef {Object} Props
   * @property {any} assignments
   * @property {any} slotType
   * @property {any} dayIndex
   * @property {any} weeklyAbsences
   * @property {any} isMemberAbsent
   * @property {any} getAbsencePeriod
   * @property {any} [onMarkAbsent] - Function to handle marking member as absent
   * @property {any} [onAddMember] - Function to handle adding member manually
   * @property {any} [onDeleteSpecificAssignment] - Function to handle deleting specific assignment
   * @property {any} [onShowAbsenceDetails] - Function to handle showing absence details
   */

  /** @type {Props} */
  let {
    assignments,
    slotType,
    dayIndex,
    weeklyAbsences,
    isMemberAbsent,
    getAbsencePeriod,
    enableAnimations = true,
    onMarkAbsent = null,
    onAddMember = null,
    onDeleteSpecificAssignment = null,
    onShowAbsenceDetails = null,
  } = $props();

  let slotAssignments = $derived(
    assignments
      .filter((a) => a.weekday === dayIndex && a.slot_type === slotType)
      .sort((a, b) => {
        // Sort order: regular -> specific -> absent
        const getOrder = (assignment) => {
          const isAbsent =
            weeklyAbsences.length > 0 &&
            isMemberAbsent(assignment.member_id, dayIndex, slotType);
          if (isAbsent) return 2; // Absent members last
          if (assignment.is_specific_date) return 1; // Specific assignments second
          return 0; // Regular assignments first
        };

        const orderDiff = getOrder(a) - getOrder(b);
        if (orderDiff !== 0) return orderDiff;

        // Within same category, sort alphabetically
        return (a.first_name || "").localeCompare(b.first_name || "");
      })
  );
  let presentMembersCount = $derived(
    slotAssignments.filter(
      (a) => !isMemberAbsent(a.member_id, dayIndex, slotType)
    ).length
  );
  let shouldShowWarning = $derived(
    slotType === "ouverture"
      ? presentMembersCount === 0
      : presentMembersCount <= 1
  );
  let warningText = $derived(
    slotType === "ouverture"
      ? "Créneau vide"
      : presentMembersCount === 0
        ? "Créneau vide"
        : "Fermeture avec un seul membre"
  );
</script>

<div class="relative flex flex-col w-full h-full px-2 md:px-0">
  <SlotWarning {shouldShowWarning} {warningText} />

  <div
    class="flex items-center justify-center flex-1"
    class:pt-16={shouldShowWarning}
  >
    <SlotAssignmentsList
      {slotAssignments}
      {weeklyAbsences}
      {dayIndex}
      {slotType}
      {isMemberAbsent}
      {getAbsencePeriod}
      {enableAnimations}
      {onMarkAbsent}
      {onDeleteSpecificAssignment}
      {onAddMember}
      {onShowAbsenceDetails}
    />
  </div>
</div>
