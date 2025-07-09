<script>
  import MemberTag from './MemberTag.svelte';
  
  export let assignments;
  export let slotType;
  export let dayIndex;
  export let onRemove;
  export let onAdd;
</script>

<div class="flex flex-wrap gap-2">
  {#each assignments.filter(a => a.weekday === dayIndex && a.slot_type === slotType) as assignment (assignment.id)}
    <MemberTag 
      text={assignment.first_name}
      showButton={true}
      buttonGradient="from-red-400/100 to-red-700"
      buttonHoverGradient="hover:from-red-400/90 hover:to-red-500/90"
      buttonRing="focus:ring-red-500/50"
      buttonIcon="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
      buttonTooltip="Supprimer"
      onClick={() => onRemove(assignment.id)}
    />
  {/each}
</div>
<!-- Add button positioned at bottom right -->
<button 
  type="button"
  class="absolute bottom-2 right-2 w-8 h-8 bg-gradient-to-br from-slate-600/80 to-slate-700/80 hover:from-slate-500/90 hover:to-slate-600/90 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-500/50 backdrop-blur-sm shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40 transition-all duration-300 hover:scale-110 border border-slate-400/30"
  on:click={() => onAdd(dayIndex, slotType)}
>
  <span class="sr-only">Ajouter membre</span>
  <svg class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
  </svg>
</button>