// Main JavaScript file for common functionality
document.addEventListener('DOMContentLoaded', function() {
  // Common HTMX event handlers
  document.body.addEventListener('htmx:afterRequest', function(event) {
    if (event.detail.xhr.status === 200) {
      showSuccessToast('Action terminée avec succès !');
    } else if (event.detail.xhr.status >= 400) {
      showErrorToast('Une erreur s\'est produite');
    }
  });

  // Add loading states
  document.body.addEventListener('htmx:beforeRequest', function(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
      target.classList.add('opacity-50', 'cursor-not-allowed');
      target.disabled = true;
    }
  });

  document.body.addEventListener('htmx:afterRequest', function(event) {
    const target = event.target;
    if (target.tagName === 'BUTTON') {
      target.classList.remove('opacity-50', 'cursor-not-allowed');
      target.disabled = false;
    }
  });
});

// Toast notification functions
function showSuccessToast(message) {
  showToast(message, 'success');
}

function showErrorToast(message) {
  showToast(message, 'error');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' 
    ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
    : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>';

  toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${icon}
      </svg>
      ${message}
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utility functions
function formatDate(date, locale = 'fr-FR') {
  return new Date(date).toLocaleDateString(locale);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}