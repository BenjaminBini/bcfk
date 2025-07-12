<script>
  import MemberTag from './MemberTag.svelte';
  
  /**
   * @typedef {Object} Props
   * @property {string} [text]
   * @property {string} [tooltip]
   * @property {any} [onShowAbsenceDetails]
   */

  /** @type {Props} */
  let { text = '', tooltip = '', onShowAbsenceDetails = null } = $props();

  function handleClick() {
    if (onShowAbsenceDetails) {
      onShowAbsenceDetails();
    }
  }
</script>

<div
  onclick={handleClick}
  class="cursor-pointer"
  role="button"
  tabindex="0"
>
  <MemberTag 
    {text}
    tooltipText={tooltip}
    showButton={false}
    tagGradient="from-slate-600/80 to-slate-700/80"
    tagTextColor="text-slate-300"
    tagShadowColor="shadow-slate-500/25"
    tagHoverShadowColor="group-hover:shadow-slate-500/40"
    customClasses="line-through opacity-90"
  />
</div>