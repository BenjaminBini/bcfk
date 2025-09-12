<script>
  import Icon from "./Icon.svelte";
  import { gradients, shadows } from '../../lib/designTokens.js';

  /**
   * @typedef {Object} Props
   * @property {string} [text]
   */

  /** @type {Props} */
  let { text = "Aucun membre" } = $props();
</script>

<div class="relative flex transition-all duration-300 delay-200 group">
  <span
    class="relative z-10 flex flex-col items-center justify-center px-3 py-3 text-xs font-semibold text-white transition-all duration-300 rounded-full shadow-lg cursor-default {gradients.warningBackground} {shadows.warning}"
  >
    <Icon name="warning" size="w-4 h-4" className="mr-2" />
    {text}
  </span>
</div>
