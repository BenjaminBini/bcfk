// Assignments page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  initializeAssignmentSelects();
  setupMemberForm();
});

function initializeAssignmentSelects() {
  // Handle multiple select changes for assignments
  document.querySelectorAll('select[multiple]').forEach(select => {
    select.addEventListener('change', debounce(function() {
      handleAssignmentChange(this);
    }, 300));
  });
}

function handleAssignmentChange(selectElement) {
  const selectedIds = Array.from(selectElement.selectedOptions).map(option => option.value);
  
  // Extract weekday and slot type from the name attribute
  const nameParts = selectElement.name.split('_');
  const weekday = nameParts[1];
  const slotType = nameParts[2];
  
  // Send the request
  fetch(`/api/assignments/${weekday}/${slotType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ memberIds: selectedIds })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showSuccessToast('Affectation mise à jour');
      // Refresh the overview section after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showErrorToast('Erreur lors de la mise à jour');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showErrorToast('Erreur de connexion');
  });
}

function setupMemberForm() {
  const memberForm = document.querySelector('form[hx-post="/api/members"]');
  if (memberForm) {
    memberForm.addEventListener('htmx:afterRequest', function(event) {
      if (event.detail.xhr.status === 200) {
        // Clear the form
        this.reset();
        // Reload page after successful member addition to update selects
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }
}