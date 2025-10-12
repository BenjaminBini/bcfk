<script>
  import { ScheduleActionService } from "../../services/scheduleActionService.js";
  import WeeklyScheduleGrid from "../table/WeeklyScheduleGrid.svelte";
  import ColumnHeader from "../table/ColumnHeader.svelte";
  import DayHeaderCell from "../table/DayHeaderCell.svelte";
  import { getContext } from "svelte";
  import CurrentDayIndicator from "./CurrentDayIndicator.svelte";

  // Local state
  let showTodayLabel = $state(false);

  setTimeout(() => {
    showTodayLabel = true;
  }, 500);

  let currentWeekOffset = 0;
  let navigationDirection = null; // 'left' or 'right' for animation purposes

  let { dates = [], schedule = [] } = $props();

  let context = getContext("schedule-context");
  let weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
</script>

<div class="relative block" id="schedule-grid-container">
  <!-- Label grid positioned above main grid -->
  <CurrentDayIndicator {dates} {showTodayLabel} />
  <!-- Horizontal scroll container for the table -->
  <div class="relative pb-2 overflow-x-auto custom-scrollbar">
    <div class="min-w-full">
      <WeeklyScheduleGrid>
        <!-- Header row -->
        <div class="h-6 w-14"></div>
        {#each dates as date, _}
          {@const currentDate = new Date(date)}

          <DayHeaderCell date={currentDate} {navigationDirection} />
        {/each}
      </WeeklyScheduleGrid>
    </div>
  </div>
</div>
