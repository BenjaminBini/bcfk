<script>
  import CalendarDayCell from './CalendarDayCell.svelte';

  /**
   * @typedef {Object} Props
   * @property {number} year - Year to display
   * @property {number} month - Month to display (0-11)
   * @property {Object} [selection] - Current selection state
   * @property {function} [onDayClick] - Callback when a day is clicked
   */

  let {
    year,
    month,
    selection = null,
    onDayClick
  } = $props();

  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Get today's date string for comparison
  const today = new Date().toISOString().split('T')[0];

  /**
   * Generate calendar grid for the month
   */
  function getCalendarDays() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week for first day (0 = Sunday, adjust to Monday = 0)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const date = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, date, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, date, isCurrentMonth: true, isToday: date === today });
    }

    // Next month days to fill grid (6 rows)
    const totalCells = 42; // 6 rows × 7 days
    let nextDay = 1;
    while (days.length < totalCells) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const date = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
      days.push({ day: nextDay, date, isCurrentMonth: false });
      nextDay++;
    }

    return days;
  }

  let calendarDays = $derived(getCalendarDays());
</script>

<div class="flex flex-col gap-1">
  <!-- Day of week headers -->
  <div class="grid grid-cols-7 gap-1 mb-1">
    {#each dayLabels as label}
      <div class="text-xs font-medium text-center text-slate-400 py-1">
        {label}
      </div>
    {/each}
  </div>

  <!-- Calendar grid -->
  <div class="grid grid-cols-7 gap-1">
    {#each calendarDays as dayInfo (dayInfo.date)}
      <CalendarDayCell
        day={dayInfo.day}
        date={dayInfo.date}
        isCurrentMonth={dayInfo.isCurrentMonth}
        isToday={dayInfo.isToday}
        {selection}
        onClick={onDayClick}
      />
    {/each}
  </div>
</div>
