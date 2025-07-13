<script>
  import { toasts, removeToast } from '../stores/toast.js';
  import { fly } from 'svelte/transition';
  import Icon from './Icon.svelte';

  function getToastClass(type) {
    const baseClass = 'px-6 py-4 rounded-lg shadow-lg text-white font-medium flex items-center space-x-3 max-w-md';
    
    switch (type) {
      case 'success':
        return `${baseClass} bg-green-600`;
      case 'error':
        return `${baseClass} bg-red-600`;
      case 'warning':
        return `${baseClass} bg-yellow-600`;
      default:
        return `${baseClass} bg-gray-600`;
    }
  }

  function getIconName(type) {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'error';
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
      <Icon name={getIconName(toast.type)} size="w-5 h-5" className="flex-shrink-0" />
      <span class="flex-1">{toast.message}</span>
      <button 
        onclick={() => removeToast(toast.id)}
        class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors"
      >
        <Icon name="close" size="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>