<script>
  import { onMount } from 'svelte';
  import { assignmentActions, assignments, isLoading, error } from '../stores/assignments.js';
  import { absenceActions } from '../stores/absences.js';
  import { writable } from 'svelte/store';
  import WeeklyScheduleGrid from '../components/table/WeeklyScheduleGrid.svelte';
  import ColumnHeader from '../components/table/ColumnHeader.svelte';
  import RowHeader from '../components/table/RowHeader.svelte';
  import Cell from '../components/table/Cell.svelte';
  import SlotCell from '../components/SlotCell.svelte';
  import SlotTypeCell from '../components/SlotTypeCell.svelte';
  import DayHeaderCell from '../components/DayHeaderCell.svelte';
  import PageHeader from '../components/PageHeader.svelte';
  import RowHeaderCell from '../components/RowHeaderCell.svelte';
  import AbsenteesCell from '../components/AbsenteesCell.svelte';
  import ContentWrapper from '../components/ContentWrapper.svelte';
  import AbsenceConfirmModal from '../components/AbsenceConfirmModal.svelte';
  import { showToast } from '../stores/toast.js';

  let weeklyAbsences = writable([]);

  onMount(async () => {
    await assignmentActions.loadData();
    await loadWeeklyAbsences();
  });


  // Helper function to format date for tooltip
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  // Helper function to get absence period for a member
  function getAbsencePeriod(memberId) {
    const absence = $weeklyAbsences.find(a => a.member_id === memberId);
    if (!absence) return '';
    
    const startDate = formatDate(absence.start_date);
    const endDate = formatDate(absence.end_date);
    
    return startDate === endDate ? startDate : `${startDate} au ${endDate}`;
  }

  // Calculate absence data for all days reactively
  $: absenceData = ($assignments.length > 0 && $weeklyAbsences.length > 0) ? weekDays.map((_, dayIndex) => {
    const absentScheduled = getAbsentScheduledMembers(dayIndex, 'ouverture').concat(getAbsentScheduledMembers(dayIndex, 'fermeture'));
    const absentOthers = getOtherAbsentMembers(dayIndex);
    
    // Combine all absent members and remove duplicates
    const allAbsentMembers = [...absentScheduled, ...absentOthers];
    const uniqueAbsentMembers = allAbsentMembers.filter((member, index, self) => 
      self.findIndex(m => m.member_id === member.member_id) === index
    );
    
    return {
      uniqueAbsentMembers
    };
  }) : weekDays.map(() => ({ uniqueAbsentMembers: [] }));

  async function loadWeeklyAbsences() {
    const weekDates = getCurrentWeekDates();
    const startDate = weekDates[0].toISOString().split('T')[0];
    const endDate = weekDates[6].toISOString().split('T')[0];
    
    try {
      const absences = await absenceActions.getAbsencesForDateRange(startDate, endDate);
      weeklyAbsences.set(absences);
    } catch (error) {
      console.error('Error loading weekly absences:', error);
      weeklyAbsences.set([]);
    }
  }

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - start) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
    return weekNumber;
  }

  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }


  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Helper function to check if a member is absent on a specific date
  function isMemberAbsent(memberId, dateIndex) {
    const date = getCurrentWeekDates()[dateIndex].toISOString().split('T')[0];
    return $weeklyAbsences.some(absence => {
      return absence.member_id === memberId && 
             absence.start_date <= date && 
             absence.end_date >= date;
    });
  }

  // Get all absent members for a specific date
  function getAbsentMembersForDate(dateIndex) {
    const date = getCurrentWeekDates()[dateIndex].toISOString().split('T')[0];
    return $weeklyAbsences.filter(absence => {
      return absence.start_date <= date && absence.end_date >= date;
    });
  }

  // Get absent members who were scheduled for a specific date and slot
  function getAbsentScheduledMembers(dateIndex, slotType) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMembers = $assignments.filter(a => a.weekday === dateIndex && a.slot_type === slotType);
    return scheduledMembers.filter(member => isMemberAbsent(member.member_id, dateIndex));
  }

  // Get absent members who were NOT scheduled for a specific date (any slot)
  function getOtherAbsentMembers(dateIndex) {
    if ($weeklyAbsences.length === 0) return [];
    const scheduledMemberIds = new Set(
      $assignments
        .filter(a => a.weekday === dateIndex)
        .map(a => a.member_id)
    );
    
    const absentMembers = getAbsentMembersForDate(dateIndex);
    return absentMembers.filter(absence => !scheduledMemberIds.has(absence.member_id));
  }

  // Modal state for absence confirmation
  let showAbsenceModal = false;
  let selectedMemberId = null;
  let selectedMemberName = '';
  let selectedDayIndex = 0;

  function handleMarkAbsent(memberId, memberName, dayIndex) {
    selectedMemberId = memberId;
    selectedMemberName = memberName;
    selectedDayIndex = dayIndex;
    showAbsenceModal = true;
  }

  function closeAbsenceModal() {
    showAbsenceModal = false;
    selectedMemberId = null;
    selectedMemberName = '';
    selectedDayIndex = 0;
  }

  async function confirmAbsence() {
    if (!selectedMemberId) return;
    
    try {
      const selectedDate = getCurrentWeekDates()[selectedDayIndex].toISOString().split('T')[0];
      
      // Create absence for the specific date (start and end date are the same)
      await absenceActions.createAbsence(selectedMemberId, selectedDate, selectedDate);
      
      // Reload absences to reflect the change
      await loadWeeklyAbsences();
      
      showToast(`${selectedMemberName} marqué(e) comme absent(e)`, 'success');
      closeAbsenceModal();
    } catch (error) {
      console.error('Error creating absence:', error);
      showToast('Erreur lors de la création de l\'absence', 'error');
    }
  }
</script>

<div class="py-10">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader 
      title="Planning Semaine {getCurrentWeek()}"
      startDate={getCurrentWeekDates()[0]}
      endDate={getCurrentWeekDates()[6]}
    />

    <!-- Content -->
    <div class="mt-8">
      <ContentWrapper isLoading={$isLoading} error={$error}>
        <WeeklyScheduleGrid>
          <!-- Header row -->
          <ColumnHeader></ColumnHeader>
          {#each weekDays as day, dayIndex}
            <ColumnHeader>
              <DayHeaderCell day={day} date={getCurrentWeekDates()[dayIndex]} />
            </ColumnHeader>
          {/each}

          <!-- Ouverture row -->
          <RowHeader>
            <SlotTypeCell slotType="ouverture" />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            <Cell>
              <SlotCell
                assignments={$assignments}
                slotType="ouverture"
                dayIndex={dayIndex}
                weeklyAbsences={$weeklyAbsences}
                isMemberAbsent={isMemberAbsent}
                getAbsencePeriod={getAbsencePeriod}
                onMarkAbsent={handleMarkAbsent}
              />
            </Cell>
          {/each}

          <!-- Fermeture row -->
          <RowHeader>
            <SlotTypeCell slotType="fermeture" />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            <Cell variant="third">
              <SlotCell
                assignments={$assignments}
                slotType="fermeture"
                dayIndex={dayIndex}
                weeklyAbsences={$weeklyAbsences}
                isMemberAbsent={isMemberAbsent}
                getAbsencePeriod={getAbsencePeriod}
                onMarkAbsent={handleMarkAbsent}
              />
            </Cell>
          {/each}

          <!-- Absences row -->
          <RowHeader>
            <RowHeaderCell 
              title="Absences"
              iconPath="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"
            />
          </RowHeader>
          {#each weekDays as _, dayIndex}
            {@const dayAbsenceData = absenceData[dayIndex] || { uniqueAbsentMembers: [] }}
            
            <Cell>
              <AbsenteesCell 
                absentMembers={dayAbsenceData.uniqueAbsentMembers}
                getAbsencePeriod={getAbsencePeriod}
              />
            </Cell>
          {/each}
        </WeeklyScheduleGrid>
      </ContentWrapper>
    </div>
  </div>
</div>

<!-- Absence Confirmation Modal -->
<AbsenceConfirmModal 
  show={showAbsenceModal}
  memberName={selectedMemberName}
  date={selectedDayIndex >= 0 ? getCurrentWeekDates()[selectedDayIndex]?.toLocaleDateString('fr-FR') : ''}
  dayIndex={selectedDayIndex}
  on:confirm={confirmAbsence}
  on:cancel={closeAbsenceModal}
/>