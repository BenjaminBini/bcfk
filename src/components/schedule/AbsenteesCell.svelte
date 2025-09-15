<script>
  import Icon from "../common/Icon.svelte";
  import AbsenceGroup from "../absences/AbsenceGroup.svelte";
  import { getAbsencePeriod } from "../../lib/absence/absenceUtils.js";
  import { getContext } from "svelte";

  let {
    dayIndex = null,
    currentDate = null,
    weekNavigationLogic,
    onShowAbsenceDetails = null,
  } = $props();

  let slotAbsentMembers = $state([]);

  let unifiedScheduleContext = getContext("unifiedSchedule");

  function getAbsencePeriodForMember(memberId, dayIndex) {
    // For now, return empty since this is mostly used for period display which we can implement later
    return [];
  }

  // Computed absence groups
  let absenceGroups = $derived({
    fullDay: slotAbsentMembers.filter(
      (member) => member?.absence_slots === "both"
    ),
    ouvertureOnly: slotAbsentMembers.filter(
      (member) => member?.absence_slots === "ouverture"
    ),
    fermetureOnly: slotAbsentMembers.filter(
      (member) => member?.absence_slots === "fermeture"
    ),
  });

  // Load absent members from unified context data
  $effect(() => {
    if (dayIndex === null || !currentDate) {
      slotAbsentMembers = [];
      return;
    }

    try {
      const rawScheduleData = unifiedScheduleContext.scheduleData;
      if (!rawScheduleData?.schedule) {
        slotAbsentMembers = [];
        return;
      }

      // Get the current week data (unified context provides 7-day array directly)
      const currentWeekData = rawScheduleData.schedule;
      const dayData = currentWeekData[dayIndex];

      if (!dayData?.allAbsentMembers) {
        slotAbsentMembers = [];
        return;
      }

      // Transform unified absence data to the format expected by AbsenceGroup components
      const absentMembers = [];

      // Add full day absences
      dayData.allAbsentMembers.fullDay.forEach(member => {
        absentMembers.push({
          ...member,
          absence_slots: 'both',
          // Fields are now consistent with API format
          first_name: member.first_name,
          last_name: member.last_name,
          member_id: member.memberId
        });
      });

      // Add ouverture only absences
      dayData.allAbsentMembers.ouvertureOnly.forEach(member => {
        absentMembers.push({
          ...member,
          absence_slots: 'ouverture',
          // Fields are now consistent with API format
          first_name: member.first_name,
          last_name: member.last_name,
          member_id: member.memberId
        });
      });

      // Add fermeture only absences
      dayData.allAbsentMembers.fermetureOnly.forEach(member => {
        absentMembers.push({
          ...member,
          absence_slots: 'fermeture',
          // Fields are now consistent with API format
          first_name: member.first_name,
          last_name: member.last_name,
          member_id: member.memberId
        });
      });

      slotAbsentMembers = absentMembers;
    } catch (error) {
      console.error(
        `Error loading absence data for dayIndex ${dayIndex}:`,
        error
      );
      slotAbsentMembers = [];
    }
  });
</script>

{#if slotAbsentMembers.length > 0}
  <div
    class="inset-0 flex flex-col justify-center h-full py-4 space-y-4 text-slate-300 from-amber-500/10 to-orange-500/10"
  >
    <AbsenceGroup
      title="Toute la journée"
      members={absenceGroups.fullDay}
      getAbsencePeriod={getAbsencePeriodForMember}
      {dayIndex}
      {onShowAbsenceDetails}
    />

    <AbsenceGroup
      title="Ouverture uniquement"
      members={absenceGroups.ouvertureOnly}
      getAbsencePeriod={getAbsencePeriodForMember}
      {dayIndex}
      {onShowAbsenceDetails}
    />

    <AbsenceGroup
      title="Fermeture uniquement"
      members={absenceGroups.fermetureOnly}
      getAbsencePeriod={getAbsencePeriodForMember}
      {dayIndex}
      {onShowAbsenceDetails}
    />
  </div>
{:else}
  <div
    class="absolute inset-0 flex items-center justify-center bg-gradient-to-r backdrop-blur-sm text-slate-300 from-emerald-500/10 to-teal-500/10"
  >
    <Icon name="success" size="w-5 h-5" className="mr-2 text-emerald-400" />
    <span class="text-xs">Aucune absence</span>
  </div>
{/if}
