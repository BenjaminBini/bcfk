<script>
  import { scale } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";
  import Icon from "../common/Icon.svelte";
  import { absenceActions } from "../../stores/absences.js";

  let {
    absentMembers,
    getAbsencePeriod,
    dayIndex = null,
    currentDate = null,
    absenceManagement = null,
    onShowAbsenceDetails = null,
  } = $props();

  // State for slot-specific absent members
  let slotAbsentMembers = $state([]);

  // Create a reactive dependency on the weeklyAbsences store
  let weeklyAbsencesValue = $state([]);

  // Subscribe to weeklyAbsences changes
  $effect(() => {
    if (absenceManagement?.weeklyAbsences) {
      return absenceManagement.weeklyAbsences.subscribe((value) => {
        weeklyAbsencesValue = value;
      });
    }
  });

  // Load slot-specific data when dayIndex changes or when absence data updates
  $effect(async () => {
    if (dayIndex !== null && currentDate) {
      try {
        // Depend on weeklyAbsencesValue to trigger updates when absences change
        // This line creates a reactive dependency on the weeklyAbsences data
        weeklyAbsencesValue.length; // Access to create dependency

        // Use the passed currentDate instead of calculating it
        const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

        // Call the API directly with the formatted date to get fresh data
        const members = await absenceActions.getAbsentMembersForDate(date);
        slotAbsentMembers = members;
      } catch (error) {
        console.error(
          "Error loading slot-specific absence data for dayIndex",
          dayIndex,
          ":",
          error.message || error
        );
        slotAbsentMembers = [];
      }
    } else {
      slotAbsentMembers = [];
    }
  });

  // Group absences by type: full-day, opening-only, closing-only
  let absenceGroups = $state({
    fullDay: [],
    ouvertureOnly: [],
    fermetureOnly: [],
  });

  // Update absenceGroups when slotAbsentMembers changes
  $effect(() => {
    if (!slotAbsentMembers || !Array.isArray(slotAbsentMembers)) {
      absenceGroups.fullDay = [];
      absenceGroups.ouvertureOnly = [];
      absenceGroups.fermetureOnly = [];
      return;
    }

    const fullDay = [];
    const ouvertureOnly = [];
    const fermetureOnly = [];

    slotAbsentMembers.forEach((member) => {
      if (member && member.absence_slots === "both") {
        fullDay.push(member);
      } else if (member && member.absence_slots === "ouverture") {
        ouvertureOnly.push(member);
      } else if (member && member.absence_slots === "fermeture") {
        fermetureOnly.push(member);
      }
    });

    absenceGroups.fullDay = fullDay;
    absenceGroups.ouvertureOnly = ouvertureOnly;
    absenceGroups.fermetureOnly = fermetureOnly;
  });

  function renderMemberName(member) {
    return member.first_name || "Membre inconnu";
  }
</script>

{#if slotAbsentMembers.length > 0}
  <div
    class="inset-0 flex flex-col justify-center h-full space-y-4 text-slate-300 from-amber-500/10 to-orange-500/10"
  >
    {#if absenceGroups.fullDay.length > 0}
      <div>
        <div class="mb-2 text-xs font-medium text-center text-slate-400">
          Toute la journée
        </div>
        <div class="flex flex-wrap items-center justify-center gap-1">
          {#each absenceGroups.fullDay as member (member.member_id || member.id)}
            <span
              class="inline-block px-2 py-1 text-xs font-medium transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30 hover:from-slate-400/80 hover:to-slate-500/80"
              title={`Absent ${getAbsencePeriod(member.member_id, dayIndex)}`}
              onclick={() => onShowAbsenceDetails?.(renderMemberName(member), member.member_id)}
              in:scale={{
                duration: 400,
                easing: quintOut,
                start: 0.5,
                opacity: 0,
              }}
              out:scale={{
                duration: 200,
                easing: quintOut,
                start: 0.5,
                opacity: 0,
              }}
              animate:flip={{ duration: 300, easing: quintOut, delay: 200 }}
            >
              {renderMemberName(member)}
            </span>
          {/each}
        </div>
      </div>
    {/if}
    <!-- Opening-only absences (left half) -->
    {#if absenceGroups.ouvertureOnly.length > 0}
      <!-- Title for opening section -->
      <div>
        <div class="mb-2 text-xs font-medium text-center text-slate-400">
          Ouverture uniquement
        </div>
        <div class="flex flex-wrap items-center justify-center gap-1">
          {#each absenceGroups.ouvertureOnly as member (member.member_id || member.id)}
            <span
              class="inline-block px-2 py-1 text-xs font-medium transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30 hover:from-slate-400/80 hover:to-slate-500/80"
              title={`Absent ${getAbsencePeriod(member.member_id, dayIndex)}`}
              onclick={() => onShowAbsenceDetails?.(renderMemberName(member), member.member_id)}
              in:scale={{
                duration: 400,
                easing: quintOut,
                start: 0.5,
                opacity: 0,
              }}
              out:scale={{
                duration: 200,
                easing: quintOut,
                start: 0.5,
                opacity: 0,
              }}
              animate:flip={{ duration: 300, easing: quintOut, delay: 200 }}
            >
              {renderMemberName(member)}
            </span>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Closing-only absences (right half) -->
    {#if absenceGroups.fermetureOnly.length > 0}
      <div>
        <div class="flex flex-col items-center justify-center flex-1">
          <!-- Title for closing section -->
          <div class="mb-2 text-xs font-medium text-slate-400">
            Fermeture uniquement
          </div>
          <div class="flex flex-wrap items-center justify-center gap-1">
            {#each absenceGroups.fermetureOnly as member (member.member_id || member.id)}
              <span
                class="inline-block px-2 py-1 text-xs font-medium transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r backdrop-blur-sm text-slate-200 from-slate-500/80 to-slate-600/80 border-slate-400/30 hover:from-slate-400/80 hover:to-slate-500/80"
                title={`Absent ${getAbsencePeriod(member.member_id, dayIndex)}`}
                onclick={() => onShowAbsenceDetails?.(renderMemberName(member), member.member_id)}
                in:scale={{
                  duration: 400,
                  easing: quintOut,
                  start: 0.5,
                  opacity: 0,
                }}
                out:scale={{
                  duration: 200,
                  easing: quintOut,
                  start: 0.5,
                  opacity: 0,
                }}
                animate:flip={{ duration: 300, easing: quintOut, delay: 200 }}
              >
                {renderMemberName(member)}
              </span>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<!-- No absences -->
{#if slotAbsentMembers.length === 0}
  <div
    class="absolute inset-0 flex items-center justify-center bg-gradient-to-r backdrop-blur-sm text-slate-300 from-emerald-500/10 to-teal-500/10"
  >
    <Icon name="success" size="w-5 h-5" className="mr-2 text-emerald-400" />
    <span class="text-xs">Aucune absence</span>
  </div>
{/if}
