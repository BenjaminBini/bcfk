<script>
  import { getContext } from 'svelte';
  import { getIcon } from '../../lib/icons';
  import MemberTag from './MemberTag.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltip]
   * @property {boolean} [showAbsentButton]
   * @property {any} [onMarkAbsent]
   * @property {number} [memberId]
   * @property {number} [dayIndex]
   * @property {string} [slotType]
   */

  /** @type {Props} */
  let {
    text = '',
    tooltip = '',
    showAbsentButton = false,
    onMarkAbsent = null,
    enableColorTransitions = true,
    animationDuration = 'duration-500',
    memberId = null,
    dayIndex = null,
    slotType = null
  } = $props();

  // Get unified schedule context for transition detection
  const unifiedScheduleContext = getContext('unifiedSchedule');

  function handleAbsentClick() {
    // Small delay to let user see the slide-out button animation
    setTimeout(() => {
      if (onMarkAbsent) {
        onMarkAbsent();
      }
    }, 200);
  }

  // Check if this member has a transition animation (absent -> present)
  let hasTransition = $derived(() => {
    if (!unifiedScheduleContext || memberId === null || dayIndex === null || !slotType) {
      return false;
    }
    const transition = unifiedScheduleContext.getMemberTransition(memberId, dayIndex, slotType);
    return transition && transition.to === 'present' && transition.from === 'absent';
  });


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
  {enableColorTransitions}
  {animationDuration}
  forceTransitionAnimation={hasTransition}
  {memberId}
  {dayIndex}
  {slotType}
/>