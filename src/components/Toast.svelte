<script>
  import { toasts, removeToast } from '../stores/toast.js';
  import { fly } from 'svelte/transition';

  function getToastClass(type) {
    const baseClass = 'px-6 py-4 rounded-lg shadow-lg text-white font-medium flex items-center space-x-3 max-w-md';
    
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-600`;
      case 'error':
        return `${baseClass} bg-red-600`;
      case 'warning':
        return `${baseClass} bg-yellow-600`;
      case 'info':
        return `${baseClass} bg-blue-600`;
      default:
        return `${baseClass} bg-gray-600`;
    }
  }

  function getIcon(type) {
    switch (type) {
      case 'success':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>`;
      case 'error':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>`;
      case 'warning':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>`;
      case 'info':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    }
  }
</script>

<!-- Toast Container -->
<div class="fixed top-4 right-4 z-50 space-y-2">
  {#each $toasts as toast (toast.id)}
    <div 
      class={getToastClass(toast.type)}
      transition:fly={{ x: 300, duration: 300 }}
    >
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {@html getIcon(toast.type)}
      </svg>
      <span class="flex-1">{toast.message}</span>
      <button 
        on:click={() => removeToast(toast.id)}
        class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  {/each}
</div>