<script>
  import Tooltip from './Tooltip.svelte';
  
  export let absentMembers;
  export let getAbsencePeriod;
</script>

{#if absentMembers.length > 0}
  <div class="flex flex-wrap gap-1">
    {#each absentMembers as member}
      <Tooltip text="Absent du {getAbsencePeriod(member.member_id)}" position="top">
        <span class="inline-block px-3 py-1.5 text-xs font-semibold text-slate-200 bg-gradient-to-r from-slate-500/80 to-slate-600/80 rounded-full cursor-help backdrop-blur-sm border border-slate-400/30 hover:bg-gradient-to-r hover:from-slate-400/90 hover:to-slate-500/90 transition-all duration-300 hover:scale-105">
          {member.first_name || 'Membre inconnu'}
        </span>
      </Tooltip>
    {/each}
  </div>
{:else}
  <!-- No absences -->
  <div class="absolute inset-0 flex items-center justify-center text-slate-300 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm">
    <svg class="w-5 h-5 mr-2 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
    </svg>
    <span class="text-xs">Aucune absence</span>
  </div>
{/if}