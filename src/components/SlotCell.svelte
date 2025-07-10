<script>
  import SlotWarning from './SlotWarning.svelte';
  import SlotAssignmentsList from './SlotAssignmentsList.svelte';
  
  export let assignments;
  export let slotType;
  export let dayIndex;
  export let weeklyAbsences;
  export let isMemberAbsent;
  export let getAbsencePeriod;
  export let onMarkAbsent = null; // Function to handle marking member as absent
  export let onAddMember = null; // Function to handle adding member manually
  export let onDeleteSpecificAssignment = null; // Function to handle deleting specific assignment
  
  $: slotAssignments = assignments
    .filter(a => a.weekday === dayIndex && a.slot_type === slotType)
    .sort((a, b) => {
      // Sort order: regular -> specific -> absent
      const getOrder = (assignment) => {
        const isAbsent = weeklyAbsences.length > 0 && isMemberAbsent(assignment.member_id, dayIndex);
        if (isAbsent) return 2; // Absent members last
        if (assignment.is_specific_date) return 1; // Specific assignments second
        return 0; // Regular assignments first
      };
      
      const orderDiff = getOrder(a) - getOrder(b);
      if (orderDiff !== 0) return orderDiff;
      
      // Within same category, sort alphabetically
      return (a.first_name || '').localeCompare(b.first_name || '');
    });
  $: shouldShowWarning = slotType === 'ouverture' ? slotAssignments.length === 0 : slotAssignments.length <= 1;
  $: warningText = slotType === 'ouverture' ? 'Aucun membre' : 
                  (slotAssignments.length === 0 ? 'Aucun membre' : 'Membre seul');
  
</script>

<div class="flex flex-col h-full">
  <SlotWarning {shouldShowWarning} {warningText} />
  
  <div class="flex-1 flex items-center justify-center">
    <SlotAssignmentsList 
      {slotAssignments}
      {weeklyAbsences}
      {dayIndex}
      {slotType}
      {isMemberAbsent}
      {getAbsencePeriod}
      {onMarkAbsent}
      {onDeleteSpecificAssignment}
      {onAddMember}
    />
  </div>
</div>