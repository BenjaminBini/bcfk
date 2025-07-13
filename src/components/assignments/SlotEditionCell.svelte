<script>
  import MemberTag from '../members/MemberTag.svelte';
  import Icon from '../common/Icon.svelte';
  
  let {
    assignments,
    slotType,
    dayIndex,
    onRemove,
    onAdd
  } = $props();

  function handleRemove(assignmentId) {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      onRemove(assignmentId);
    }, 200);
  }
</script>

<div class="flex flex-col flex-wrap gap-4 justify-center items-center w-full h-full">
  {#each assignments.filter(a => a.weekday === dayIndex && a.slot_type === slotType) as assignment (assignment.id)}
    <MemberTag 
      text={assignment.first_name}
      showButton={true}
      buttonGradient="from-red-400/100 to-red-700"
      buttonHoverGradient="hover:from-red-400/90 hover:to-red-500/90"
      buttonRing="focus:ring-red-500/50"
      buttonIcon="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      buttonTooltip="Supprimer"
      onClick={() => handleRemove(assignment.id)}
    />
  {/each}
  
  <!-- Add button moved into same flex container -->
  <button 
    type="button"
    class="flex justify-center items-center w-6 h-6 bg-gradient-to-br rounded-full border shadow-lg backdrop-blur-sm transition-all duration-300 from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 focus:outline-none focus:ring-2 focus:ring-slate-500/50 shadow-slate-500/25 hover:shadow-slate-500/40 hover:scale-110 border-slate-400/30"
    onclick={() => onAdd(dayIndex, slotType)}
  >
    <span class="sr-only">Ajouter membre</span>
    <Icon name="plus" size="w-3 h-3" className="text-white" />
  </button>
</div>