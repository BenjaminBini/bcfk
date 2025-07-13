<script>
  import { getIcon } from '../../lib/icons.js';
  
  /**
   * @typedef {Object} Props
   * @property {string} [name]
   * @property {string} [size]
   * @property {string} [className]
   * @property {boolean} [ariaHidden]
   */

  /** @type {Props} */
  let {
    name = '',
    size = 'w-4 h-4',
    className = '',
    ariaHidden = true
  } = $props();
  
  let iconData = $derived(getIcon(name));
  let classes = $derived(`${size} ${className}`.trim());
</script>

{#if iconData}
{#if iconData.icon}
  {@html iconData.icon}
{:else}
  <svg 
    class={classes}
    viewBox={iconData.viewBox}
    fill={iconData.fill || 'none'}
    stroke={iconData.stroke || 'none'}
    stroke-width={iconData.strokeWidth || '0'}
    stroke-linecap={iconData.strokeLinecap || 'butt'}
    stroke-linejoin={iconData.strokeLinejoin || 'miter'}
    aria-hidden={ariaHidden}
  >
    <path 
      d={iconData.path}
      fill-rule={iconData.fillRule || 'nonzero'}
      clip-rule={iconData.clipRule || 'nonzero'}
    />
  </svg>
{/if}
{:else}
  <!-- Fallback for unknown icon names -->
  <div class={classes} title="Unknown icon: {name}">?</div>
{/if}