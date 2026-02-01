<script>
  import { getIcon } from '../../lib/icons.js';

  /**
   * @typedef {Object} Props
   * @property {string} value - Current selected slot ('ouverture', 'fermeture', or 'both')
   * @property {boolean} [allowBoth] - Whether to allow selecting both slots (for single day)
   * @property {function} [onChange] - Callback when selection changes
   */

  let {
    value = 'ouverture',
    allowBoth = false,
    onChange
  } = $props();

  const sunIcon = getIcon('sun');
  const moonIcon = getIcon('moon');

  function selectOuverture() {
    onChange?.('ouverture');
  }

  function selectFermeture() {
    onChange?.('fermeture');
  }

  let isOuvertureSelected = $derived(value === 'ouverture' || value === 'both');
  let isFermetureSelected = $derived(value === 'fermeture' || value === 'both');

  // For range mode: sliding indicator
  let indicatorStyle = $derived(
    value === 'ouverture' ? 'left: 0; width: 50%;' : 'left: 50%; width: 50%;'
  );
</script>

{#if allowBoth}
  <!-- Single day mode: three-state toggle (morning / evening / both) -->
  <div class="relative inline-flex items-center gap-0.5 px-1 py-1 rounded-lg bg-slate-700/40 border border-slate-600/40">
    <!-- Animated sliding indicator -->
    <div
      class="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out pointer-events-none
        {value === 'ouverture' ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30' : ''}
        {value === 'fermeture' ? 'bg-gradient-to-r from-indigo-500/30 to-indigo-600/30' : ''}
        {value === 'both' ? 'bg-gradient-to-r from-amber-500/30 via-blue-500/30 to-indigo-500/30' : ''}"
      style="{value === 'ouverture' ? 'left: 4px; width: 36px;' : ''}{value === 'fermeture' ? 'left: 42px; width: 36px;' : ''}{value === 'both' ? 'left: 80px; width: 72px;' : ''}"
    ></div>

    <!-- Ouverture button -->
    <button
      type="button"
      onclick={() => onChange?.('ouverture')}
      class="relative z-10 p-2 rounded-md transition-colors duration-150 {value === 'ouverture' || value === 'both' ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}"
      aria-label="Ouverture"
      title="Ouverture"
    >
      <svg class="w-5 h-5 transition-transform duration-150 {value === 'ouverture' ? 'scale-110' : ''}" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
        <path d={sunIcon.path} />
      </svg>
    </button>

    <!-- Fermeture button -->
    <button
      type="button"
      onclick={() => onChange?.('fermeture')}
      class="relative z-10 p-2 rounded-md transition-colors duration-150 {value === 'fermeture' || value === 'both' ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'}"
      aria-label="Fermeture"
      title="Fermeture"
    >
      <svg class="w-5 h-5 transition-transform duration-150 {value === 'fermeture' ? 'scale-110' : ''}" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
        <path d={moonIcon.path} />
      </svg>
    </button>

    <!-- Both button -->
    <button
      type="button"
      onclick={() => onChange?.('both')}
      class="relative z-10 p-2 rounded-md transition-colors duration-150 flex items-center gap-1"
      aria-label="Journée complète"
      title="Journée complète"
    >
      <svg class="w-5 h-5 transition-all duration-150 {value === 'both' ? 'text-amber-400 scale-110' : 'text-slate-400'}" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
        <path d={sunIcon.path} />
      </svg>
      <span class="text-xs {value === 'both' ? 'text-slate-300' : 'text-slate-500'}">+</span>
      <svg class="w-5 h-5 transition-all duration-150 {value === 'both' ? 'text-indigo-400 scale-110' : 'text-slate-400'}" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
        <path d={moonIcon.path} />
      </svg>
    </button>
  </div>
{:else}
  <!-- Range mode: sliding toggle -->
  <div class="relative inline-flex items-center px-1.5 py-1 rounded-lg bg-slate-700/40 border border-slate-600/40">
    <!-- Animated background indicator -->
    <div class="absolute top-1 bottom-1 left-1.5 right-1.5 pointer-events-none">
      <div
        class="absolute top-0 bottom-0 rounded-md bg-gradient-to-r from-blue-500/30 to-blue-600/30 transition-all duration-300 ease-out"
        style={indicatorStyle}
      ></div>
    </div>

    <!-- Ouverture button -->
    <button
      type="button"
      onclick={selectOuverture}
      class="relative z-10 p-2 rounded-md transition-colors duration-150 {isOuvertureSelected ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'}"
      aria-label="Ouverture"
      title="Ouverture"
    >
      <svg class="w-5 h-5 transition-transform duration-150 {isOuvertureSelected ? 'scale-110' : ''}" viewBox={sunIcon.viewBox} fill={sunIcon.fill}>
        <path d={sunIcon.path} />
      </svg>
    </button>

    <!-- Fermeture button -->
    <button
      type="button"
      onclick={selectFermeture}
      class="relative z-10 p-2 rounded-md transition-colors duration-150 {isFermetureSelected ? 'text-indigo-400' : 'text-slate-400 hover:text-indigo-400'}"
      aria-label="Fermeture"
      title="Fermeture"
    >
      <svg class="w-5 h-5 transition-transform duration-150 {isFermetureSelected ? 'scale-110' : ''}" viewBox={moonIcon.viewBox} fill={moonIcon.fill}>
        <path d={moonIcon.path} />
      </svg>
    </button>
  </div>
{/if}
