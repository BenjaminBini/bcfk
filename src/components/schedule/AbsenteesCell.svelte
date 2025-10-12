<script>
  // Props
  let {
    fullDayAbsent = [],
    ouvertureOnlyAbsent = [],
    fermetureOnlyAbsent = []
  } = $props();

  // Calculate total absences
  const totalAbsences = $derived(() =>
    fullDayAbsent.length + ouvertureOnlyAbsent.length + fermetureOnlyAbsent.length
  );

  // Check if we have any absences
  const hasAbsences = $derived(() => totalAbsences > 0);
</script>

<div class="relative flex flex-col w-full h-full px-2 py-4 min-h-30">
  {#if hasAbsences}
    <div class="flex flex-col justify-center h-full space-y-3">

      <!-- Full day absences -->
      {#if fullDayAbsent.length > 0}
        <div class="space-y-1">
          <div class="text-xs font-medium text-orange-300 opacity-75">Toute la journée</div>
          <div class="flex flex-wrap gap-1">
            {#each fullDayAbsent as member}
              <div
                class="px-2 py-1 bg-orange-600/60 text-orange-200 rounded text-xs font-medium opacity-75"
                title="Absent toute la journée"
              >
                {member.first_name}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Ouverture only absences -->
      {#if ouvertureOnlyAbsent.length > 0}
        <div class="space-y-1">
          <div class="text-xs font-medium text-red-300 opacity-75">Ouverture uniquement</div>
          <div class="flex flex-wrap gap-1">
            {#each ouvertureOnlyAbsent as member}
              <div
                class="px-2 py-1 bg-red-600/60 text-red-200 rounded text-xs font-medium opacity-75"
                title="Absent à l'ouverture uniquement"
              >
                {member.first_name}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Fermeture only absences -->
      {#if fermetureOnlyAbsent.length > 0}
        <div class="space-y-1">
          <div class="text-xs font-medium text-pink-300 opacity-75">Fermeture uniquement</div>
          <div class="flex flex-wrap gap-1">
            {#each fermetureOnlyAbsent as member}
              <div
                class="px-2 py-1 bg-pink-600/60 text-pink-200 rounded text-xs font-medium opacity-75"
                title="Absent à la fermeture uniquement"
              >
                {member.first_name}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- No absences -->
    <div class="flex items-center justify-center h-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded">
      <div class="flex items-center space-x-2">
        <div class="w-4 h-4 bg-emerald-400 rounded-full opacity-60"></div>
        <span class="text-xs text-emerald-300 opacity-75">Aucune absence</span>
      </div>
    </div>
  {/if}
</div>