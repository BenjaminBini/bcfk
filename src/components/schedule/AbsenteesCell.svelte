<script>
  import { scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';
  import Icon from '../common/Icon.svelte';
  
  let { absentMembers, getAbsencePeriod } = $props();
</script>

{#if absentMembers.length > 0}
  <div class="flex flex-col gap-3 justify-start items-center h-full">
    {#each absentMembers as member (member.member_id || member.id)}
      <span 
        class="inline-block px-3 py-1.5 text-xs font-semibold bg-gradient-to-r rounded-full border backdrop-blur-sm transition-all duration-300 cursor-pointer text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30"
        title={`Absent du ${getAbsencePeriod(member.member_id)}`}
        in:scale={{ duration: 400, easing: quintOut, start: 0.5, opacity: 0 }}
        out:scale={{ duration: 200, easing: quintOut, start: 0.5, opacity: 0 }}
        animate:flip={{ duration: 300, easing: quintOut, delay: 200 }}
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