<script>
  import { isCurrentDate } from "../../lib/dateUtils.js";

  let { dates = [], showTodayLabel = false } = $props();
</script>

<div class="relative">
  <div
    class="grid w-full gap-px"
    style="grid-template-columns: min-content repeat(7, 1fr)"
  >
    <!-- Empty corner cell -->
    <div class="h-6 w-14"></div>
    <!-- Label cells for each day -->
    {#each dates as date, dayIndex}
      {@const isToday = isCurrentDate(new Date(date))}
      <div class="flex justify-center h-6">
        {#if isToday}
          <div
            class="hidden px-2 py-1 text-xs font-medium text-blue-100 transition-transform duration-300 ease-out border border-b-0 shadow-lg md:block whitespace-nowrap rounded-t-md backdrop-blur-sm bg-blue-600/90 border-blue-400/50"
            class:translate-y-0={showTodayLabel}
            class:translate-y-7={!showTodayLabel}
          >
            Aujourd'hui
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>