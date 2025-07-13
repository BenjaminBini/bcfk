<script>
  import HelpButton from "../ui/HelpButton.svelte";
  import BurgerMenuButton from "../ui/BurgerMenuButton.svelte";
  import MobileMenu from "./MobileMenu.svelte";
  import { onMount } from "svelte";

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

  let showMobileMenu = $state(false);
  let mobileMenuRef = $state();

  function toggleMobileMenu() {
    showMobileMenu = !showMobileMenu;
  }

  function closeMobileMenu() {
    showMobileMenu = false;
  }

  function handleClickOutside(event) {
    if (mobileMenuRef && !mobileMenuRef.contains(event.target)) {
      closeMobileMenu();
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div class="flex gap-3 md:hidden">
  <HelpButton onClick={onShowLegend} />
  
  <div bind:this={mobileMenuRef}>
    <BurgerMenuButton onClick={toggleMobileMenu} />
    <MobileMenu 
      show={showMobileMenu}
      {navigationItems}
      {currentLocation}
      onItemClick={closeMobileMenu}
    />
  </div>
</div>