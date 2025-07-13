<script>
  import NavigationLink from "../ui/NavigationLink.svelte";
  import HelpButton from "../ui/HelpButton.svelte";

  /**
   * @typedef {Object} NavigationItem
   * @property {string} href - The route path
   * @property {string} label - The display text
   */

  /**
   * @typedef {Object} Props
   * @property {NavigationItem[]} navigationItems - Array of navigation items
   * @property {string} currentLocation - Current active route
   * @property {function} onShowLegend - Handler for showing legend modal
   */
  ("");
  /** @type {Props} */
  let { navigationItems, currentLocation, onShowLegend } = $props();
</script>

<div class="hidden justify-between ml-6 w-full space--8 md:flex">
  <div class="flex items-stretch ml-8 space-x-8  ml-4j ustify-start">
    {#each navigationItems as item}
      <NavigationLink
        href={item.href}
        label={item.label}
        isActive={currentLocation === item.href}
        isMobile={false}
      />
    {/each}
  </div>
  <HelpButton onClick={onShowLegend} />
</div>
