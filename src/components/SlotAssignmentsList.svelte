<script>
  import AbsentMemberTag from './AbsentMemberTag.svelte';
  import SpecificDateMemberTag from './SpecificDateMemberTag.svelte';
  import RecurrentMemberTag from './RecurrentMemberTag.svelte';
  import AddMemberButton from './AddMemberButton.svelte';
  
  export let slotAssignments = [];
  export let weeklyAbsences = [];
  export let dayIndex = 0;
  export let slotType = '';
  export let isMemberAbsent = null;
  export let getAbsencePeriod = null;
  export let onMarkAbsent = null;
  export let onDeleteSpecificAssignment = null;
  export let onAddMember = null;
</script>

<div class="flex flex-col flex-wrap gap-4 justify-start items-center h-full">
  {#each slotAssignments as assignment}
    {@const isAbsent = weeklyAbsences.length > 0 && isMemberAbsent(assignment.member_id, dayIndex)}
    {#if isAbsent}
      <AbsentMemberTag 
        text={assignment.first_name}
        tooltip="Absent du {getAbsencePeriod(assignment.member_id)}"
      />
    {:else if assignment.is_specific_date}
      <SpecificDateMemberTag 
        text={assignment.first_name}
        showButton={onDeleteSpecificAssignment !== null}
        memberName={assignment.first_name}
        slotType={slotType}
        date={assignment.date}
        onClick={() => onDeleteSpecificAssignment(assignment.id, assignment.member_id, assignment.first_name, dayIndex, slotType)}
      />
    {:else}
      <RecurrentMemberTag 
        text={assignment.first_name}
        showButton={onMarkAbsent !== null}
        buttonGradient="from-orange-400/100 to-orange-700"
        buttonHoverGradient="hover:from-orange-400/90 hover:to-orange-500/90"
        buttonRing="focus:ring-orange-500/50"
        buttonIcon="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
        buttonTooltip="Marquer comme absent"
        onClick={() => onMarkAbsent(assignment.member_id, assignment.first_name, dayIndex)}
      />
    {/if}
  {/each}
  
  <AddMemberButton {onAddMember} {dayIndex} {slotType} />
</div>