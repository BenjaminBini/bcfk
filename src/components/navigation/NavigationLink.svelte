<script>
  import { link } from "svelte-spa-router";

  /**
   * @typedef {Object} Props
   * @property {string} href - The route path
   * @property {string} label - The display text
   * @property {boolean} isActive - Whether this link is currently active
   * @property {boolean} isMobile - Whether this is for mobile or desktop layout
   * @property {function} [onClick] - Optional click handler
   */

  /** @type {Props} */
  let { href, label, isActive, isMobile, onClick } = $props();

  function handleClick() {
    if (onClick) onClick();
  }
</script>

{#if isMobile}
  <a
    {href}
    use:link
    onclick={handleClick}
    class="block w-full px-4 py-3 text-sm font-medium text-left rounded-lg transition-all duration-200 {isActive 
      ? 'text-white bg-indigo-500/20 border border-indigo-400/30' 
      : 'text-slate-300 hover:text-white hover:bg-slate-700/40'}"
  >
    {label}
  </a>
{:else}
  <a
    {href}
    use:link
    onclick={handleClick}
    class="inline-flex items-center border-b-2 px-4 pt-1 text-sm font-medium rounded-t-lg transition-all duration-300 {isActive
      ? 'border-indigo-400 text-white bg-gradient-to-t from-indigo-500/10 to-transparent'
      : 'border-transparent text-slate-300 hover:border-slate-400 hover:text-white hover:bg-gradient-to-t hover:from-slate-700/20 hover:to-transparent'}"
  >
    {label}
  </a>
{/if}