<script>
  /**
   * Pure UI component for user avatar with initials
   * @typedef {Object} Props
   * @property {string} firstName - User's first name
   * @property {string} [size] - Size variant (sm, md, lg)
   */

  /** @type {Props} */
  let { firstName, size = 'md' } = $props();

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };
</script>

<div class="flex-shrink-0 {sizeClasses[size]}">
  <div class="flex justify-center items-center {sizeClasses[size]} bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-indigo-500/25">
    <span class="{sizeClasses[size].includes('text-xs') ? 'text-xs' : sizeClasses[size].includes('text-base') ? 'text-base' : 'text-sm'} font-medium text-white">
      {firstName.charAt(0).toUpperCase()}
    </span>
  </div>
</div>