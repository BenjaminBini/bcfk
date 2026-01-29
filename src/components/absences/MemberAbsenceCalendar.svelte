<script>
  /**
   * Compact calendar component showing absence periods for a member
   * Displays 3 months (current + next 2) with absence periods highlighted
   * @typedef {Object} Props
   * @property {Array} absences - List of absence objects with start_date, end_date, start_slot, end_slot
   */

  /** @type {Props} */
  let { absences = [] } = $props();

  // Get current date and generate 3 months to display
  function generateMonths() {
    const today = new Date();
    const months = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        monthName: date.toLocaleDateString('fr-FR', { month: 'short' }),
        days: generateMonthDays(date)
      });
    }

    return months;
  }

  function generateMonthDays(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    // Convert to Monday = 0
    let firstDayOfWeek = firstDay.getDay() - 1;
    if (firstDayOfWeek === -1) firstDayOfWeek = 6;

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, dateString: null });
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      days.push({ date: day, dateString });
    }

    return days;
  }

  function isAbsent(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);

    for (const absence of absences) {
      const startDate = new Date(absence.start_date);
      const endDate = new Date(absence.end_date);

      if (date >= startDate && date <= endDate) {
        // Determine if it's partial day absence
        const isStartDate = dateString === absence.start_date;
        const isEndDate = dateString === absence.end_date;
        const isSingleDay = absence.start_date === absence.end_date;

        if (isSingleDay) {
          // Single day absence
          if (absence.start_slot === 'ouverture' && absence.end_slot === 'fermeture') {
            return 'full'; // All day
          } else if (absence.start_slot === absence.end_slot) {
            return absence.start_slot === 'ouverture' ? 'morning' : 'evening';
          } else {
            return 'full'; // Mixed slots
          }
        } else {
          // Multi-day absence
          if (isStartDate && absence.start_slot === 'fermeture') {
            return 'evening'; // Only evening of start date
          } else if (isEndDate && absence.end_slot === 'ouverture') {
            return 'morning'; // Only morning of end date
          } else {
            return 'full'; // Full day
          }
        }
      }
    }

    return null;
  }

  function getDayClass(dateString) {
    const absenceType = isAbsent(dateString);
    if (!absenceType) return 'bg-slate-800/50 hover:bg-slate-700/50';

    if (absenceType === 'full') {
      return 'bg-red-600/80 hover:bg-red-500/80 text-white font-medium';
    } else if (absenceType === 'morning') {
      return 'bg-gradient-to-b from-red-600/80 to-slate-800/50 hover:from-red-500/80 hover:to-slate-700/50 text-white font-medium';
    } else if (absenceType === 'evening') {
      return 'bg-gradient-to-b from-slate-800/50 to-red-600/80 hover:from-slate-700/50 hover:to-red-500/80 text-white font-medium';
    }
  }

  function isToday(dateString) {
    if (!dateString) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  }

  let months = $derived(generateMonths());
</script>

<div class="p-2 md:p-3">
  {#if absences.length === 0}
    <div class="py-4 text-center">
      <p class="text-xs text-slate-400">Aucune absence enregistrée</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
      {#each months as month}
        <div class="overflow-hidden border rounded-lg bg-slate-900/50 border-slate-700/50">
          <!-- Month header -->
          <div class="px-2 py-1 text-xs font-medium text-center text-slate-300 bg-slate-800/80">
            {month.monthName} {month.year}
          </div>

          <!-- Day labels -->
          <div class="grid grid-cols-7 gap-px p-1 text-[9px] font-medium text-center text-slate-500 bg-slate-900/50">
            <div>L</div>
            <div>M</div>
            <div>M</div>
            <div>J</div>
            <div>V</div>
            <div>S</div>
            <div>D</div>
          </div>

          <!-- Calendar grid -->
          <div class="grid grid-cols-7 gap-px p-1 bg-slate-900/50">
            {#each month.days as day}
              {#if day.date}
                <div
                  class="relative flex items-center justify-center w-full text-[10px] transition-colors rounded aspect-square {getDayClass(day.dateString)}"
                  title={day.dateString}
                >
                  <span class="relative z-10">{day.date}</span>
                  {#if isToday(day.dateString)}
                    <div class="absolute inset-0 border-2 border-blue-400 rounded animate-pulse"></div>
                  {/if}
                </div>
              {:else}
                <div class="w-full aspect-square"></div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-2 mt-3 text-[10px] text-slate-400">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-red-600/80"></div>
        <span>Journée complète</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-gradient-to-b from-red-600/80 to-slate-800/50"></div>
        <span>Matin uniquement</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 rounded bg-gradient-to-b from-slate-800/50 to-red-600/80"></div>
        <span>Soir uniquement</span>
      </div>
    </div>
  {/if}
</div>
