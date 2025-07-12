<script>
  import NavigationLink from "../ui/NavigationLink.svelte";

  /**
   * @typedef {Object} NavigationItem
   * @property {string} href - The route path
   * @property {string} label - The display text
   */

  /**
   * @typedef {Object} Props
   * @property {NavigationItem[]} navigationItems - Array of navigation items
   * @property {string} currentLocation - Current active route
   */

  /** @type {Props} */
  let { navigationItems, currentLocation } = $props();
</script>

<div class="hidden sm:ml-6 sm:flex sm:space-x-8">
  {#each navigationItems as item}
    <NavigationLink
      href={item.href}
      label={item.label}
      isActive={currentLocation === item.href}
      isMobile={false}
    />
  {/each}
</div>