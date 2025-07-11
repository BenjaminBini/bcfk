<script>
  import { getIcon } from '../lib/icons';
  import MemberTag from './MemberTag.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltip]
   * @property {boolean} [showAbsentButton]
   * @property {any} [onMarkAbsent]
   */

  /** @type {Props} */
  let {
    text = '',
    tooltip = '',
    showAbsentButton = false,
    onMarkAbsent = null
  } = $props();

  function handleAbsentClick() {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      if (onMarkAbsent) {
        onMarkAbsent();
      }
    }, 200);
  }
</script>

<MemberTag 
  {text}
  tooltipText={tooltip}
  showButton={showAbsentButton}
  buttonGradient="from-orange-400/100 to-orange-700"
  buttonHoverGradient="hover:from-orange-400/90 hover:to-orange-500/90"
  buttonRing="focus:ring-orange-500/50"
  buttonIcon={getIcon("plane").path}
  buttonTooltip="Marquer comme absent"
  onClick={handleAbsentClick}
/>