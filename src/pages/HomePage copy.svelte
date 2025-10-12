<script>
  import { onMount, onDestroy, setContext } from "svelte";
  import { createUnifiedScheduleContext } from "../lib/unifiedScheduleContext.svelte.js";
  import { WEEK_DAYS } from "../lib/constants.js";
  import {
    members,
    assignments,
    assignmentActions,
    isLoading,
  } from "../stores/assignments.js";
  import PageHeader from "../components/layout/PageHeader.svelte";
  import ContentWrapper from "../components/layout/ContentWrapper.svelte";
  import ScheduleGrid from "../components/schedule/ScheduleGrid.svelte";
  import { getCurrentWeekStartDate } from "../lib/dateUtils.js";
  import { fetchWeekData } from "../services/schedule-service.js";

  // Create unified sczhedule context
  console.log("then")
   let scheduleContext = $state({
    dates: [],
    schedule: [],
    isLoading: false,
   });

  onMount(async () => {
    console.logs("first")
    // Load both schedule and members data in parallel
    scheduleContext.isLoading = true;
    let startDate = getCurrentWeekStartDate();
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    let data = await fetchWeekData(startDate, endDate);
    let scheduleContext = $state({
      ...data,
      isLoading: false,
    });
    setContext("schedule-context", scheduleContext );
  });
</script>

<div class="text-white">{scheduleContext.schedule}</div>
{#if  scheduleContext.schedule && !scheduleContext.isLoading}
  <div class="py-4 md:py-10">
    <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
      <!-- Page header -->
      <PageHeader
        title={getFormattedWeekTitle()}
        subtitle="Géré par Binio"
        mobileTitle="Semaine {getCurrentWeek()}"
        startDate={getCurrentWeekDates()[0]}
        endDate={getCurrentWeekDates()[6]}
        showWeekNavigation={true}
        isLoading={scheduleContext.isNavigationDisabled}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
      />

      <!-- Content -->
      <div class="mt-4 md:mt-8">
        <ContentWrapper isLoading={false} error={scheduleContext.error}>
          <ScheduleGrid />
        </ContentWrapper>
      </div>
    </div>
  </div>
{:else}
  <div class="py-4 md:py-10">
    <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
      <ContentWrapper isLoading={true} error={scheduleContext.error}>
        <div class="text-center text-slate-400">Chargement...</div>
      </ContentWrapper>
    </div>
  </div>
{/if}
