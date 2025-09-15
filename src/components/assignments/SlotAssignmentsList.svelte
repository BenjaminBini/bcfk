<script>
  import { scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import AbsenceMemberTag from '../absences/AbsenceMemberTag.svelte';
  import SpecificDateMemberTag from '../members/SpecificDateMemberTag.svelte';
  import RecurrentMemberTag from '../members/RecurrentMemberTag.svelte';
  import AddMemberButton from '../members/AddMemberButton.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {any} [slotAssignments]
   * @property {any} [presentAssignedMembers]
   * @property {any} [absentAssignedMembers]
   * @property {any} [occasionalPresentMembers]
   * @property {number} [dayIndex]
   * @property {string} [slotType]
   * @property {any} [weekNavigationLogic]
   * @property {any} [onMarkAbsent]
   * @property {any} [onDeleteSpecificAssignment]
   * @property {any} [onAddMember]
   * @property {any} [onShowAbsenceDetails]
   * @property {number} [animationDelay]
   */

  /** @type {Props} */
  let {
    slotAssignments = [],
    presentAssignedMembers = [],
    absentAssignedMembers = [],
    occasionalPresentMembers = [],
    dayIndex = 0,
    slotType = '',
    weekNavigationLogic = null,
    enableAnimations = true,
    onMarkAbsent = null,
    onDeleteSpecificAssignment = null,
    onAddMember = null,
    onShowAbsenceDetails = null,
    animationDelay = 0
  } = $props();

  function getAbsencePeriodForMember() {
    // For now, return empty since this is mostly used for period display which we can implement later
    return [];
  }
</script>

<div class="flex flex-col items-center justify-start h-full gap-3">
  {#each slotAssignments as member, index (member.id || `${member.memberId}-${dayIndex}-${slotType}`)}
    {@const memberType = index < (slotAssignments.length - absentAssignedMembers.length - occasionalPresentMembers.length) ? 'present' :
                         index < (slotAssignments.length - absentAssignedMembers.length) ? 'occasional' : 'absent'}
    <div
      in:scale={enableAnimations ? { duration: 400, easing: quintOut, start: 0.5, opacity: 0, delay: animationDelay + (index * 50) } : undefined}
      out:scale={enableAnimations ? { duration: 200, easing: quintOut, start: 0.5, opacity: 0 } : undefined}
      animate:flip={enableAnimations ? { duration: 300, easing: quintOut, delay: 200 + animationDelay } : undefined}
    >
      {#if memberType === 'absent'}
        <AbsenceMemberTag
          member={member}
          absencePeriod=""
          onShowDetails={() => onShowAbsenceDetails?.(member)}
          enableColorTransitions={enableAnimations}
          animationDuration="duration-500"
          memberId={member.memberId}
          dayIndex={dayIndex}
          slotType={slotType}
        />
      {:else if memberType === 'occasional'}
        <SpecificDateMemberTag
          text={member.first_name}
          showDeleteButton={onDeleteSpecificAssignment !== null}
          memberName={member.first_name}
          slotType={slotType}
          {dayIndex}
          {weekNavigationLogic}
          onDelete={() => onDeleteSpecificAssignment(member.id, member.memberId, member.first_name, dayIndex, slotType)}
          enableColorTransitions={enableAnimations}
          animationDuration="duration-500"
        />
      {:else}
        <RecurrentMemberTag
          text={member.first_name}
          showAbsentButton={onMarkAbsent !== null}
          onMarkAbsent={() => onMarkAbsent(member.memberId, member.first_name, dayIndex, slotType)}
          enableColorTransitions={enableAnimations}
          animationDuration="duration-500"
          memberId={member.memberId}
          dayIndex={dayIndex}
          slotType={slotType}
        />
      {/if}
    </div>
  {/each}

  <!-- Animated wrapper for AddMemberButton to ensure smooth position transitions -->
  <div
    class="transition-all duration-300 ease-out transform add-member-container"
    style="transition-delay: {animationDelay + (slotAssignments.length * 50)}ms"
  >
    <AddMemberButton {onAddMember} {dayIndex} {slotType} />
  </div>
</div>