<script>
  import NavigationLink from "../ui/NavigationLink.svelte";

  /**
   * @typedef {Object} NavigationItem
   * @property {string} href - The route path
   * @property {string} label - The display text
   */

  /**
   * @typedef {Object} Props
   * @property {boolean} show - Whether to show the mobile menu
   * @property {NavigationItem[]} navigationItems - Array of navigation items
   * @property {string} currentLocation - Current active route
   * @property {function} onItemClick - Handler for when a menu item is clicked
   */

  /** @type {Props} */
  let { show, navigationItems, currentLocation, onItemClick } = $props();
</script>

{#if show}
  <div class="absolute top-14 right-0 w-48 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl p-2 z-[9999]">
    {#each navigationItems as item}
      <NavigationLink
        href={item.href}
        label={item.label}
        isActive={currentLocation === item.href}
        isMobile={true}
        onClick={onItemClick}
      />
    {/each}
  </div>
{/if}