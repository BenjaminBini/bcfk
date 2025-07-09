<script>
  import Tooltip from './Tooltip.svelte';
  import MemberTag from './MemberTag.svelte';
  
  export let assignments;
  export let slotType;
  export let dayIndex;
  export let weeklyAbsences;
  export let isMemberAbsent;
  export let getAbsencePeriod;
  export let onMarkAbsent = null; // Function to handle marking member as absent
  
  $: slotAssignments = assignments.filter(a => a.weekday === dayIndex && a.slot_type === slotType);
  $: shouldShowWarning = slotType === 'ouverture' ? slotAssignments.length === 0 : slotAssignments.length <= 1;
  $: warningText = slotType === 'ouverture' ? 'Aucun membre' : 
                  (slotAssignments.length === 0 ? 'Aucun membre' : 'Membre seul');
  
</script>

{#if shouldShowWarning && slotAssignments.length === 0}
  <div class="absolute inset-0 flex items-center justify-center space-x-2 text-amber-100 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm">
    <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
    <span class="text-xs font-semibold">{warningText}</span>
  </div>
{:else}
  {#if shouldShowWarning && slotAssignments.length === 1}
    <div class="absolute top-0 left-0 right-0 flex items-center justify-center space-x-2 text-amber-100 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm px-3 py-2 border-b border-amber-500/30">
      <svg class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
      <span class="text-xs font-semibold">{warningText}</span>
    </div>
    <div class="pt-12 flex flex-wrap gap-2">
      {#each slotAssignments as assignment}
        {@const isAbsent = weeklyAbsences.length > 0 && isMemberAbsent(assignment.member_id, dayIndex)}
        {#if isAbsent}
          <MemberTag 
            text={assignment.first_name}
            tooltip="Absent du {getAbsencePeriod(assignment.member_id)}"
            variant="absent"
          />
        {:else}
          <MemberTag 
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
    </div>
  {:else}
    <div class="flex flex-wrap gap-2">
      {#each slotAssignments as assignment}
        {@const isAbsent = weeklyAbsences.length > 0 && isMemberAbsent(assignment.member_id, dayIndex)}
        {#if isAbsent}
          <MemberTag 
            text={assignment.first_name}
            tooltip="Absent du {getAbsencePeriod(assignment.member_id)}"
            variant="absent"
          />
        {:else}
          <MemberTag 
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
    </div>
  {/if}
{/if}