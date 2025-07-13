<script>
  /**
   * Pure UI component for the legend container panel
   * Provides the styled container with gradient background and layout
   */

  let { children } = $props();
</script>

<!-- Compact Legend Panel -->
<div
  class="flex relative justify-center items-center p-4 mb-6 bg-gradient-to-r rounded-lg border backdrop-blur-sm border-slate-700"
>
  <div class="flex flex-wrap gap-6 justify-center text-sm">
    {@render children()}
  </div>
</div>