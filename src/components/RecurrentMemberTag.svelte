<script>
  import MemberTag from './MemberTag.svelte';
  
  export let text = '';
  export let tooltip = '';
  export let showButton = false;
  export let buttonGradient = 'from-red-400/100 to-red-700';
  export let buttonHoverGradient = 'hover:from-red-400/90 hover:to-red-500/90';
  export let buttonRing = 'focus:ring-red-500/50';
  export let buttonIcon = '';
  export let buttonTooltip = '';
  export let onClick = null;

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
  {tooltip}
  {showButton}
  {buttonGradient}
  {buttonHoverGradient}
  {buttonRing}
  {buttonIcon}
  {buttonTooltip}
  onClick={handleButtonClick}
/>