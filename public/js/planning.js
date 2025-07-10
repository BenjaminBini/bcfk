// Planning page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  setupPlanningActions();
});

function setupPlanningActions() {
  // Handle generate week button
  const generateButton = document.querySelector('button[hx-post="/api/generate-week"]');
  if (generateButton) {
    generateButton.addEventListener('htmx:afterRequest', function(event) {
      if (event.detail.xhr.status === 200) {
        showSuccessToast('Planning généré avec succès');
        // Refresh planning data via HTMX instead of full page reload
        const planningContainer = document.querySelector('[hx-get="/planning"]');
        if (planningContainer) {
          htmx.trigger(planningContainer, 'refresh');
        }
      }
    });
  }

  // Handle refresh button
  const refreshButton = document.querySelector('button[hx-get="/planning"]');
  if (refreshButton) {
    refreshButton.addEventListener('htmx:afterRequest', function(event) {
      if (event.detail.xhr.status === 200) {
        showSuccessToast('Planning actualisé');
      }
    });
  }
}

// Planning-specific utility functions
function highlightSlot(date, slotType) {
  const slots = document.querySelectorAll(`[data-date="${date}"][data-slot="${slotType}"]`);
  slots.forEach(slot => {
    slot.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
    setTimeout(() => {
      slot.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
    }, 2000);
  });
}

function updateSlotContent(date, slotType, members) {
  const slot = document.querySelector(`[data-date="${date}"][data-slot="${slotType}"] .slot-content`);
  if (slot) {
    slot.innerHTML = '';
    if (members.length === 0) {
      slot.innerHTML = '<div class="text-xs italic text-gray-500">Aucune affectation</div>';
    } else {
      members.forEach(member => {
        const badge = document.createElement('span');
        badge.className = `inline-block px-2 py-1 text-xs font-semibold text-white rounded-full";
        badge.textContent = member.display_name || member.name;
        slot.appendChild(badge);
      });
    }
  }
}