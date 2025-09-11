<script>
  import Icon from "../common/Icon.svelte";
  import AbsenceGroup from "../absences/AbsenceGroup.svelte";
  import { absenceActions } from "../../stores/absences.js";
  import { formatDateToISO } from "../../lib/dateUtils.js";

  let {
    dayIndex = null,
    currentDate = null,
    absenceManagement = null,
    getAbsencePeriod,
    onShowAbsenceDetails = null,
  } = $props();

  let slotAbsentMembers = $state([]);

  // Computed absence groups
  let absenceGroups = $derived({
    fullDay: slotAbsentMembers.filter(member => member?.absence_slots === "both"),
    ouvertureOnly: slotAbsentMembers.filter(member => member?.absence_slots === "ouverture"),
    fermetureOnly: slotAbsentMembers.filter(member => member?.absence_slots === "fermeture"),
  });

  // Load absent members when data changes
  $effect(async () => {
    if (dayIndex === null || !currentDate) {
      slotAbsentMembers = [];
      return;
    }

    try {
      // Create reactive dependency on absence store
      if (absenceManagement?.weeklyAbsences) {
        absenceManagement.weeklyAbsences.subscribe(() => {});
      }

      const date = formatDateToISO(currentDate);
      const members = await absenceActions.getAbsentMembersForDate(date);
      slotAbsentMembers = members || [];
    } catch (error) {
      console.error(`Error loading absence data for dayIndex ${dayIndex}:`, error);
      slotAbsentMembers = [];
    }
  });
</script>

{#if slotAbsentMembers.length > 0}
  <div class="inset-0 flex flex-col justify-center h-full space-y-4 text-slate-300 from-amber-500/10 to-orange-500/10">
    <AbsenceGroup
      title="Toute la journée"
      members={absenceGroups.fullDay}
      {getAbsencePeriod}
      {dayIndex}
      {onShowAbsenceDetails}
    />
    
    <AbsenceGroup
      title="Ouverture uniquement"
      members={absenceGroups.ouvertureOnly}
      {getAbsencePeriod}
      {dayIndex}
      {onShowAbsenceDetails}
    />
    
    <AbsenceGroup
      title="Fermeture uniquement"
      members={absenceGroups.fermetureOnly}
      {getAbsencePeriod}
      {dayIndex}
      {onShowAbsenceDetails}
    />
  </div>
{:else}
  <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-r backdrop-blur-sm text-slate-300 from-emerald-500/10 to-teal-500/10">
    <Icon name="success" size="w-5 h-5" className="mr-2 text-emerald-400" />
    <span class="text-xs">Aucune absence</span>
  </div>
{/if}
