<script>
  import { onMount, onDestroy, setContext } from "svelte";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import ContentWrapper from "../components/layout/ContentWrapper.svelte";
  import ScheduleGrid from "../components/schedule/ScheduleGrid.svelte";
  import { getCurrentWeekStartDate } from "../lib/dateUtils.js";
  import { fetchWeekData } from "../services/schedule-service.js";
  import { formatDateRange } from "../lib/dateUtils.js";
  // Create unified sczhedule context
  let scheduleContext = $state({
    dates: [],
    schedule: [],
    isLoading: false,
  });

  setContext("schedule-context", scheduleContext);

  onMount(async function () {
    // Load both schedule and members data in parallel
    scheduleContext.isLoading = true;
    let startDate = getCurrentWeekStartDate();
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    let data = await fetchWeekData(startDate, endDate);
    scheduleContext.dates = data.dates;
    scheduleContext.isLoading = false;
  });

  function onPreviousWeek() {
    offsetWeekBy(-1);
    //loadWeek(firstDate, lastDate);
  }

  function onNextWeek() {
    offsetWeekBy(1);
    //loadWeek(firstDate, lastDate);
  }

  function offsetWeekBy(n) {
    let datesOfNextWeek = Array.from({ length: 7 }, (_, i) => {
      let d = new Date(scheduleContext.dates[0]);
      d.setDate(d.getDate() + 7 * n + i);
      return d.toISOString();
    });
    scheduleContext.dates = datesOfNextWeek;
    //loadWeek(firstDate, lastDate);
  }
</script>

{JSON.stringify(scheduleContext)}

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader
      title={`Planning ${formatDateRange(scheduleContext.dates)}`}
      subtitle="Géré par Binio"
      mobileTitle="Semaine"
      startDate={new Date(scheduleContext.dates[0])}
      endDate={new Date(scheduleContext.dates[6])}
      showWeekNavigation={true}
      isLoading={scheduleContext.isLoading}
      {onPreviousWeek}
      {onNextWeek}
    />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      <ContentWrapper isLoading={false} error={scheduleContext.error}>
        <ScheduleGrid
          dates={scheduleContext.dates}
          schedule={scheduleContext.schedule}
        />
      </ContentWrapper>
    </div>
  </div>
</div>
<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <ContentWrapper isLoading={true} error={scheduleContext.error}>
      <div class="text-center text-slate-400">Chargement...</div>
    </ContentWrapper>
  </div>
</div>
