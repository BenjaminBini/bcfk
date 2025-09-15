<script>
  import { onMount, setContext } from "svelte";
  import { createUnifiedScheduleContext } from "../lib/unifiedScheduleContext.svelte.js";

  // Create unified schedule context
  let scheduleContext = createUnifiedScheduleContext();
  setContext('unifiedSchedule', scheduleContext);

  onMount(async () => {
    console.log("Loading unified schedule data...");
    await scheduleContext.loadInitialData();
    console.log("Schedule data loaded:", scheduleContext.scheduleData);
  });
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-4">Unified Schedule Test</h1>

  {#if scheduleContext.isLoading}
    <div class="text-blue-500">Loading unified schedule data...</div>
  {:else if scheduleContext.error}
    <div class="text-red-500">Error: {scheduleContext.error}</div>
  {:else if scheduleContext.scheduleData}
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold">Data Summary</h2>
        <div class="text-sm text-gray-600">
          <p>Total dates: {scheduleContext.scheduleData.dates?.length || 0}</p>
          <p>Total schedule entries: {scheduleContext.scheduleData.schedule?.length || 0}</p>
          <p>Current week dates: {scheduleContext.currentWeekDates.length} days</p>
          <p>Current week data: {scheduleContext.currentWeekData.length} days</p>
        </div>
      </div>

      <div>
        <h3 class="font-medium mb-2">Current Week Dates:</h3>
        <div class="flex gap-2 text-sm">
          {#each scheduleContext.currentWeekDates as date}
            <span class="bg-blue-100 px-2 py-1 rounded">{date}</span>
          {/each}
        </div>
      </div>

      <div>
        <h3 class="font-medium mb-2">Sample Day Data (First Day):</h3>
        {#if scheduleContext.currentWeekData[0]}
          {@const firstDay = scheduleContext.currentWeekData[0]}
          <div class="bg-gray-50 p-3 rounded text-sm">
            <p><strong>Date:</strong> {firstDay.date}</p>
            <p><strong>Day:</strong> {firstDay.dayName}</p>
            <p><strong>Ouverture Present:</strong> {firstDay.ouverture.presentAssignedMembers.length}</p>
            <p><strong>Ouverture Absent:</strong> {firstDay.ouverture.absentAssignedMembers.length}</p>
            <p><strong>Ouverture Occasional:</strong> {firstDay.ouverture.occasionalPresentMembers.length}</p>
            <p><strong>Fermeture Present:</strong> {firstDay.fermeture.presentAssignedMembers.length}</p>
            <p><strong>All Absent Members:</strong> {firstDay.allAbsentMembers.fullDay.length + firstDay.allAbsentMembers.ouvertureOnly.length + firstDay.allAbsentMembers.fermetureOnly.length}</p>
          </div>
        {/if}
      </div>

      <div class="space-x-2">
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onclick={scheduleContext.goToPreviousWeek}
        >
          ← Previous Week
        </button>
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onclick={scheduleContext.goToNextWeek}
        >
          Next Week →
        </button>
      </div>
    </div>
  {:else}
    <div class="text-gray-500">No data loaded</div>
  {/if}
</div>