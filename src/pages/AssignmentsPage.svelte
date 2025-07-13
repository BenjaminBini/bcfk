<script>
  import { onMount } from 'svelte';
  import { assignmentActions, assignments, members, isLoading, error } from '../stores/assignments.js';
  import MemberSelector from '../components/members/MemberSelector.svelte';
  import WeeklyScheduleGrid from '../components/table/WeeklyScheduleGrid.svelte';
  import ColumnHeader from '../components/table/ColumnHeader.svelte';
  import RowHeader from '../components/table/RowHeader.svelte';
  import Cell from '../components/table/Cell.svelte';
  import DayHeaderCell from '../components/schedule/DayHeaderCell.svelte';
  import SlotEditionCell from '../components/schedule/SlotEditionCell.svelte';
  import ContentWrapper from '../components/layout/ContentWrapper.svelte';
  import PageHeader from '../components/layout/PageHeader.svelte';
  import RowHeaderCell from '../components/schedule/RowHeaderCell.svelte';

  onMount(() => {
    assignmentActions.loadData();
  });


  const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  let showMemberSelector = $state(false);
  let selectedSlot = $state(null);
  let selectedDay = $state(null);

  function openMemberSelector(dayIndex, slotType) {
    console.log('Opening member selector:', { dayIndex, slotType });
    selectedDay = dayIndex;
    selectedSlot = slotType;
    showMemberSelector = true;
    console.log('Selected values:', { selectedDay, selectedSlot });
  }

  function closeMemberSelector() {
    showMemberSelector = false;
    selectedSlot = null;
    selectedDay = null;
  }

  async function assignMembers(memberIds) {
    try {
      console.log('Assigning members:', { memberIds, selectedDay, selectedSlot });
      
      const optimisticAssignments = [];
      const apiCalls = [];
      
      // Process each member
      for (const memberId of memberIds) {
        // Find the member details
        const member = $members.find(m => m.id === memberId);
        if (!member) continue;

        // Create optimistic assignment
        const optimisticAssignment = {
          id: Date.now() + Math.random(), // Temporary ID
          weekday: selectedDay,
          slot_type: selectedSlot,
          member_id: memberId,
          first_name: member.first_name
        };
        
        optimisticAssignments.push(optimisticAssignment);
        
        // Create API call promise
        const apiCall = fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            weekday: selectedDay,
            slot_type: selectedSlot,
            member_id: memberId
          })
        }).then(async response => {
          if (response.ok) {
            const newAssignment = await response.json();
            newAssignment.first_name = member.first_name;
            return { success: true, optimistic: optimisticAssignment, real: newAssignment };
          } else {
            return { success: false, optimistic: optimisticAssignment };
          }
        });
        
        apiCalls.push(apiCall);
      }

      // Update local state immediately (optimistic update)
      assignments.update(current => [...current, ...optimisticAssignments]);

      // Wait for all API calls to complete
      const results = await Promise.all(apiCalls);
      
      // Process results
      const successfulAssignments = [];
      const failedAssignments = [];
      
      results.forEach(result => {
        if (result.success) {
          successfulAssignments.push(result);
        } else {
          failedAssignments.push(result.optimistic);
        }
      });
      
      // Update assignments: replace successful optimistic with real data, remove failed ones
      assignments.update(current => {
        let updated = current;
        
        // Replace successful optimistic assignments with real data
        successfulAssignments.forEach(({ optimistic, real }) => {
          updated = updated.map(a => a.id === optimistic.id ? real : a);
        });
        
        // Remove failed assignments
        failedAssignments.forEach(failed => {
          updated = updated.filter(a => a.id !== failed.id);
        });
        
        return updated;
      });
      
      if (failedAssignments.length > 0) {
        console.error(`Failed to assign ${failedAssignments.length} members`);
      }
      
      closeMemberSelector();
    } catch (error) {
      console.error('Error assigning members:', error);
      await assignmentActions.loadData();
    }
  }

  async function removeMember(assignmentId) {
    try {
      // Store the assignment for potential rollback
      const assignmentToRemove = $assignments.find(a => a.id === assignmentId);
      if (!assignmentToRemove) return;

      // Update local state immediately (optimistic update)
      assignments.update(current => current.filter(a => a.id !== assignmentId));

      // Make API call
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        // Revert optimistic update on error
        assignments.update(current => [...current, assignmentToRemove]);
        const errorText = await response.text();
        console.error('Failed to remove assignment:', response.status, errorText);
      }
    } catch (err) {
      console.error('Error removing assignment:', err);
      // Reload data if there's an unexpected error
      await assignmentActions.loadData();
    }
  }

</script>

<div class="py-4 md:py-10">
  <div class="px-2 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
    <!-- Page header -->
    <PageHeader 
      title="Affectations hebdomadaires"
      subtitle="Configurez les affectations par défaut pour chaque créneau"
      icon="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.407-1.84-.407-2.81.68-.537 1.426-1.047 2.279-1.525v-.181zM14 11.459v.181c.853.478 1.598.988 2.279 1.525 0 .97-.197 1.911-.407 2.81.508-.29 1.026-.564 1.554-.82a.75.75 0 00.419-.74 41.029 41.029 0 00-.39-3.114 29.848 29.848 0 00-2.455 1.158z"
    />

    <!-- Content -->
    <div class="mt-4 md:mt-8">
      <ContentWrapper isLoading={$isLoading} error={$error}>
        <!-- Horizontal scroll container for the table -->
        <div class="overflow-x-auto relative pb-2 custom-scrollbar">
          <div class="min-w-full">
            <WeeklyScheduleGrid>
              <!-- Header row -->
              <ColumnHeader isCorner={true}></ColumnHeader>
              {#each weekDays as day}
                <ColumnHeader>
                  <DayHeaderCell {day} />
                </ColumnHeader>
              {/each}

              <!-- Ouverture row -->
              <RowHeader>
                <RowHeaderCell title="Ouverture" iconName="doorOpen" />
              </RowHeader>
              {#each weekDays as _, dayIndex}
                <Cell>
                  <SlotEditionCell
                    assignments={$assignments}
                    slotType="ouverture"
                    dayIndex={dayIndex}
                    onRemove={removeMember}
                    onAdd={openMemberSelector}
                  />
                </Cell>
              {/each}

              <!-- Fermeture row -->
              <RowHeader>
                <RowHeaderCell title="Fermeture" iconName="lockClosed" />
              </RowHeader>
              {#each weekDays as _, dayIndex}
                <Cell>
                  <SlotEditionCell
                    assignments={$assignments}
                    slotType="fermeture"
                    dayIndex={dayIndex}
                    onRemove={removeMember}
                    onAdd={openMemberSelector}
                  />
                </Cell>
              {/each}
            </WeeklyScheduleGrid>
          </div>
        </div>
      </ContentWrapper>
    </div>
  </div>
</div>

<MemberSelector 
  show={showMemberSelector}
  members={$members}
  assignments={$assignments}
  selectedDay={selectedDay}
  selectedSlot={selectedSlot}
  on:select={(event) => assignMembers(event.detail.memberIds)}
  on:close={closeMemberSelector}
/>

<style>
  .custom-scrollbar {
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgb(100 116 139 / 0.7) rgb(71 85 105 / 0.3);
  }

  /* Webkit browsers (Chrome, Safari, Edge) */
  .custom-scrollbar::-webkit-scrollbar {
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(71 85 105 / 0.3);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(100 116 139 / 0.7);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgb(148 163 184 / 0.8);
  }
</style>