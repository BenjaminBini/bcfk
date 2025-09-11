<script>
  import { scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import AbsentMemberTag from '../members/AbsentMemberTag.svelte';
  import SpecificDateMemberTag from '../members/SpecificDateMemberTag.svelte';
  import RecurrentMemberTag from '../members/RecurrentMemberTag.svelte';
  import AddMemberButton from '../members/AddMemberButton.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {any} [slotAssignments]
   * @property {any} [weeklyAbsences]
   * @property {number} [dayIndex]
   * @property {string} [slotType]
   * @property {any} [isMemberAbsent]
   * @property {any} [getAbsencePeriod]
   * @property {any} [onMarkAbsent]
   * @property {any} [onDeleteSpecificAssignment]
   * @property {any} [onAddMember]
   * @property {any} [onShowAbsenceDetails]
   */

  /** @type {Props} */
  let {
    slotAssignments = [],
    weeklyAbsences = [],
    dayIndex = 0,
    slotType = '',
    isMemberAbsent = null,
    getAbsencePeriod = null,
    enableAnimations = true,
    onMarkAbsent = null,
    onDeleteSpecificAssignment = null,
    onAddMember = null,
    onShowAbsenceDetails = null
  } = $props();
</script>

<div class="flex flex-col gap-3 justify-start items-center h-full">
  {#each slotAssignments as assignment (assignment.id || `${assignment.member_id}-${assignment.weekday}-${assignment.slot_type}`)}
    {@const isAbsent = weeklyAbsences.length > 0 && isMemberAbsent(assignment.member_id, dayIndex, slotType)}
    <div
      in:scale={enableAnimations ? { duration: 400, easing: quintOut, start: 0.5, opacity: 0 } : undefined}
      out:scale={enableAnimations ? { duration: 200, easing: quintOut, start: 0.5, opacity: 0 } : undefined}
      animate:flip={enableAnimations ? { duration: 300, easing: quintOut, delay: 200 } : undefined}
    >
      {#if isAbsent}
        <AbsentMemberTag 
          text={assignment.first_name}
          tooltip="Absent du {getAbsencePeriod(assignment.member_id)}"
          onShowAbsenceDetails={() => onShowAbsenceDetails?.(assignment.first_name, assignment.member_id)}
        />
      {:else if assignment.is_specific_date}
        <SpecificDateMemberTag 
          text={assignment.first_name}
          showDeleteButton={onDeleteSpecificAssignment !== null}
          memberName={assignment.first_name}
          slotType={slotType}
          date={assignment.date}
          onDelete={() => onDeleteSpecificAssignment(assignment.id, assignment.member_id, assignment.first_name, dayIndex, slotType)}
        />
      {:else}
        <RecurrentMemberTag 
          text={assignment.first_name}
          showAbsentButton={onMarkAbsent !== null}
          onMarkAbsent={() => onMarkAbsent(assignment.member_id, assignment.first_name, dayIndex, slotType)}
        />
      {/if}
    </div>
  {/each}
  
  <AddMemberButton {onAddMember} {dayIndex} {slotType} />
</div>