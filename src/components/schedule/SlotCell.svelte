<script>
  import SlotWarning from "../assignments/SlotWarning.svelte";
  import SlotAssignmentsList from "../assignments/SlotAssignmentsList.svelte";

  /**
   * @typedef {Object} Props
   * @property {any} presentAssignedMembers - Present recurring members
   * @property {any} absentAssignedMembers - Absent members
   * @property {any} occasionalPresentMembers - Present specific date members
   * @property {any} slotType
   * @property {any} dayIndex
   * @property {any} weekNavigationLogic
   * @property {any} [onMarkAbsent] - Function to handle marking member as absent
   * @property {any} [onAddMember] - Function to handle adding member manually
   * @property {any} [onDeleteSpecificAssignment] - Function to handle deleting specific assignment
   * @property {any} [onShowAbsenceDetails] - Function to handle showing absence details
   * @property {number} [animationDelay] - Animation delay in milliseconds for staggered column animations
   */

  /** @type {Props} */
  let {
    presentAssignedMembers,
    absentAssignedMembers,
    occasionalPresentMembers,
    slotType,
    dayIndex,
    weekNavigationLogic,
    enableAnimations = true,
    onMarkAbsent = null,
    onAddMember = null,
    onDeleteSpecificAssignment = null,
    onShowAbsenceDetails = null,
    animationDelay = 0,
  } = $props();


  // Combine and sort all members: present -> occasional -> absent
  let slotAssignments = $derived(() => {
    const sortByName = (a, b) => (a.first_name || "").localeCompare(b.first_name || "");

    const sortedPresent = [...presentAssignedMembers].sort(sortByName);
    const sortedOccasional = [...occasionalPresentMembers].sort(sortByName);
    const sortedAbsent = [...absentAssignedMembers].sort(sortByName);

    return [...sortedPresent, ...sortedOccasional, ...sortedAbsent];
  });

  let presentMembersCount = $derived(presentAssignedMembers.length + occasionalPresentMembers.length);

  let shouldShowWarning = $derived(
    slotType === "ouverture"
      ? presentMembersCount === 0
      : presentMembersCount <= 1
  );

  let warningText = $derived(
   presentMembersCount === 0
      ? "Aucun inscrit"
      : "Un seul inscrit"
    );

  // Background state for animations
  let backgroundState = $derived(() => {
    if (presentMembersCount === 0) return 'empty';
    if (presentMembersCount === 1) return 'warning';
    return 'normal';
  });
</script>

<div
  class="relative flex flex-col w-full h-full px-2 py-4 transition-all duration-500 ease-in-out md:px-0 slot-cell"
  class:slot-empty={backgroundState === 'empty'}
  class:slot-warning={backgroundState === 'warning'}
  class:slot-normal={backgroundState === 'normal'}
  style="animation-delay: {animationDelay}ms"
>
  <SlotWarning {shouldShowWarning} {warningText} {enableAnimations} {animationDelay} />

  <div
    class="flex items-center justify-center flex-1 transition-all duration-300 ease-in-out"
    class:pt-12={shouldShowWarning}
  >
    <SlotAssignmentsList
      slotAssignments={slotAssignments()}
      {presentAssignedMembers}
      {absentAssignedMembers}
      {occasionalPresentMembers}
      {dayIndex}
      {slotType}
      {weekNavigationLogic}
      {enableAnimations}
      {onMarkAbsent}
      {onDeleteSpecificAssignment}
      {onAddMember}
      {onShowAbsenceDetails}
      {animationDelay}
    />
  </div>
</div>

<style>
  .slot-cell {
    position: relative;
    overflow: hidden;
    min-height: 120px; /* Ensure consistent cell height */
    height: 100%; /* Fill parent cell completely */
  }

  /* Background animations for different slot states */
  .slot-empty {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.08) 100%);
    border: 1px solid rgba(239, 68, 68, 0.1);
  }

  .slot-warning {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.08) 100%);
    border: 1px solid rgba(245, 158, 11, 0.1);
  }

  .slot-normal {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.03) 0%, rgba(21, 128, 61, 0.05) 100%);
    border: 1px solid rgba(34, 197, 94, 0.1);
  }

  /* Subtle pulse animation for empty slots */
  .slot-empty::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, transparent 70%);
    animation: pulseEmpty 3s ease-in-out infinite;
    animation-delay: inherit;
    pointer-events: none;
  }

  /* Gentle glow animation for warning slots */
  .slot-warning::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(245, 158, 11, 0.08) 0%, transparent 70%);
    animation: pulseWarning 4s ease-in-out infinite;
    animation-delay: inherit;
    pointer-events: none;
  }

  /* Subtle success glow for normal slots */
  .slot-normal::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 80%);
    animation: pulseNormal 5s ease-in-out infinite;
    animation-delay: inherit;
    pointer-events: none;
  }

  @keyframes pulseEmpty {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.02); }
  }

  @keyframes pulseWarning {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.01); }
  }

  @keyframes pulseNormal {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.005); }
  }
</style>
