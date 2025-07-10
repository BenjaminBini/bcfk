<script>
  import { tooltip } from "@svelte-plugins/tooltips";
  import Icon from './Icon.svelte';
  
  let { absentMembers, getAbsencePeriod } = $props();
</script>

{#if absentMembers.length > 0}
  <div class="flex flex-col flex-wrap gap-2 justify-center items-center h-full">
    {#each absentMembers as member}
        <span 
          class="inline-block px-3 py-1.5 text-xs font-semibold bg-gradient-to-r rounded-full border backdrop-blur-sm transition-all duration-300 cursor-help text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30 hover:bg-gradient-to-r hover:from-slate-400/90 hover:to-slate-500/90 hover:scale-105"
          use:tooltip={{ content: `Absent du ${getAbsencePeriod(member.member_id)}`, position: 'top', theme: 'high-z-index' }}
        >
          {member.first_name || 'Membre inconnu'}
        </span>
    {/each}
  </div>
{:else}
  <!-- No absences -->
  <div class="flex absolute inset-0 justify-center items-center bg-gradient-to-r backdrop-blur-sm text-slate-300 from-emerald-500/10 to-teal-500/10">
    <Icon name="success" size="w-5 h-5" className="mr-2 text-emerald-400" />
    <span class="text-xs">Aucune absence</span>
  </div>
{/if}