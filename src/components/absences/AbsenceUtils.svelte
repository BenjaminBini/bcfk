<script>
  let { weekNavigationLogic, weeklyAbsences } = $props();

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("fr-FR");
  }

  function getAbsencePeriod(memberId, dateIndex = null) {
    let currentAbsences;
    weeklyAbsences.subscribe(value => currentAbsences = value)();

    // If no specific date provided, return the first absence (backward compatibility)
    if (dateIndex === null) {
      const absence = currentAbsences.find((a) => a.member_id === memberId);
      if (!absence) return "";
      const startDate = formatDate(absence.start_date);
      const endDate = formatDate(absence.end_date);
      return startDate === endDate ? startDate : `${startDate} au ${endDate}`;
    }

    // Find the absence that covers the specific date
    const dateObj = weekNavigationLogic.getCurrentWeekDates()[dateIndex];
    const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const absence = currentAbsences.find((a) => 
      a.member_id === memberId &&
      a.start_date <= date &&
      a.end_date >= date
    );
    
    if (!absence) return "";

    const startDate = formatDate(absence.start_date);
    const endDate = formatDate(absence.end_date);

    // Same start and end date (single day absence)
    if (absence.start_date === absence.end_date) {
      // Check if it's a partial slot absence
      if (absence.start_slot && absence.end_slot && absence.start_slot === absence.end_slot) {
        return `le ${startDate} (${absence.start_slot})`;
      }
      // Full day absence or both slots
      return `le ${startDate}`;
    }

    // Multi-day absence
    let startText = startDate;
    let endText = endDate;

    // Add slot info to start date if it starts with "fermeture" slot
    if (absence.start_slot === 'fermeture') {
      startText += ' (fermeture)';
    }

    // Add slot info to end date if it ends with "ouverture" slot  
    if (absence.end_slot === 'ouverture') {
      endText += ' (ouverture)';
    }

    return `du ${startText} au ${endText}`;
  }

  export { formatDate, getAbsencePeriod };
</script>