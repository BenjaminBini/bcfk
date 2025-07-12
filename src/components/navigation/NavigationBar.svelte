<script>
  import MobileNavigation from "./MobileNavigation.svelte";
  import DesktopNavigation from "./DesktopNavigation.svelte";

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

  /** @type {Props} */
  let { navigationItems, currentLocation, onShowLegend } = $props();
</script>

<nav
  class="relative z-[100] bg-gradient-to-r border-b shadow-2xl backdrop-blur-xl from-slate-800/90 to-slate-900/90 border-slate-700/50"
>
  <div class="flex justify-start px-4 mx-auto max-w-7xl h-16 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center w-full sm:justify-start sm:w-auto">
      <h1 class="text-xl font-bold text-white shrink-0 no-wrap">
        Planning BCFK
      </h1>

      <MobileNavigation 
        {navigationItems}
        {currentLocation}
        {onShowLegend}
      />
    </div>
    
    <DesktopNavigation 
      {navigationItems}
      {currentLocation}
    />
  </div>
</nav>