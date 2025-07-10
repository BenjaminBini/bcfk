<script>
  export let title;
  export let iconPath;
</script>

<div class="flex items-center -rotate-90">
  <svg class="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath}></path>
  </svg>
  {title}
</div>