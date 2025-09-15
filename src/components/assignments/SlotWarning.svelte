<script>
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import WarningTag from '../common/WarningTag.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [shouldShowWarning]
   * @property {string} [warningText]
   * @property {boolean} [enableAnimations]
   * @property {number} [animationDelay]
   */

  /** @type {Props} */
  let {
    shouldShowWarning = false,
    warningText = '',
    enableAnimations = true,
    animationDelay = 0
  } = $props();
</script>

{#if shouldShowWarning}
  <div
    class="absolute z-0 flex flex-col items-center justify-start gap-1 px-3 py-4 text-xs font-semibold text-center border rounded-lg warning-container -inset-2 text-white/80 bg-red-600/40 border-orange-400/50 backdrop-blur-sm"
    in:fly={enableAnimations ? {
      y: -20,
      duration: 400,
      easing: quintOut,
      delay: animationDelay
    } : undefined}
    out:fly={enableAnimations ? {
      y: -10,
      duration: 200,
      easing: quintOut
    } : undefined}
  >
    <div
      class="warning-icon"
      in:scale={enableAnimations ? {
        duration: 500,
        delay: 100 + animationDelay,
        easing: quintOut,
        start: 0.5
      } : undefined}
      out:scale={enableAnimations ? {
        duration: 150,
        easing: quintOut,
        start: 0.5
      } : undefined}
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
      </svg>
    </div>

    <div
      class="warning-text"
      in:fade={enableAnimations ? {
        duration: 300,
        delay: 200 + animationDelay
      } : undefined}
      out:fade={enableAnimations ? {
        duration: 100
      } : undefined}
    >
      {warningText}
    </div>
  </div>
{/if}