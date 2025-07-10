<script>
  import { getIcon } from '../lib/icons.js';
  
  export let name = '';
  export let size = 'w-4 h-4';
  export let className = '';
  export let ariaHidden = true;
  
  $: iconData = getIcon(name);
  $: classes = `${size} ${className}`.trim();
</script>

{#if iconData}
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
{:else}
  <!-- Fallback for unknown icon names -->
  <div class={classes} title="Unknown icon: {name}">?</div>
{/if}