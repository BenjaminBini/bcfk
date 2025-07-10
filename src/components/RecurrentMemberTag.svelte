<script>
  import MemberTag from './MemberTag.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltip]
   * @property {boolean} [showButton]
   * @property {string} [buttonGradient]
   * @property {string} [buttonHoverGradient]
   * @property {string} [buttonRing]
   * @property {string} [buttonIcon]
   * @property {string} [buttonTooltip]
   * @property {any} [onClick]
   */

  /** @type {Props} */
  let {
    text = '',
    tooltip = '',
    showButton = false,
    buttonGradient = 'from-red-400/100 to-red-700',
    buttonHoverGradient = 'hover:from-red-400/90 hover:to-red-500/90',
    buttonRing = 'focus:ring-red-500/50',
    buttonIcon = '',
    buttonTooltip = '',
    onClick = null
  } = $props();

  function handleButtonClick() {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      if (onClick) {
        onClick();
      }
    }, 200);
  }
</script>

<MemberTag 
  {text}
  tooltipText={tooltip}
  {showButton}
  {buttonGradient}
  {buttonHoverGradient}
  {buttonRing}
  {buttonIcon}
  {buttonTooltip}
  onClick={handleButtonClick}
/>